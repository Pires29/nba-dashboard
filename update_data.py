"""
pipeline.py
===========
Unified pipeline for generating all JSON files optimized for the NBA app.
Corre 1x por dia via GitHub Actions.

OUTPUT (minified JSON):
  players.json              → { [playerId]: { name, num, pos, height, weight, dob } }
  teams.json                → { [teamId]: { name, abbr } }
  rosters.json              → { [teamId]: [{ id, name, num, pos }] }
  season_stats.json         → { [playerId]: { gp, min, pts, reb, ast, ... } }
  props.json                → { [playerId]: { oppId, props: { pts: { avg, l5, ... } } } }
  team_defense.json         → { [teamId]: { pts, pts_rank, ast, ast_rank, ... } }
  injuries.json             → { [teamId]: [{ pid, status, type, detail, returnDate }] }
  game_logs_current.json    → { [playerId]: [{ gid, date, opp, pts, reb, ast, stl, blk, tov, min }] }
  game_logs_prev.json       → { [playerId]: [{ gid, date, opp, pts, reb, ast, stl, blk, tov, min }] }
  game_logs_playoffs.json   → { [playerId]: [{ gid, date, opp, pts, reb, ast, stl, blk, tov, min }] }

Dependencies:
  pip install nba_api requests pandas
"""

import json
import math
import os
import time
import random
import requests
import pandas as pd
from curl_cffi import requests as curl_requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import UTC, datetime, timedelta
from collections import defaultdict
from zoneinfo import ZoneInfo

from nba_api.stats.endpoints import (
    leaguegamelog,
    leaguedashteamstats,
    scoreboardv2,
    leaguestandings,
    commonteamroster,
)

# ============================================================
# CONFIG
# ============================================================

def season_label(start_year):
    """Return an NBA season label such as 2026-27."""
    return f"{start_year}-{str(start_year + 1)[-2:]}"


today = datetime.now()

# NBA statistics roll over when the regular season begins in October. During
# the summer, keep using the season that has just ended.
stats_season_start = today.year if today.month >= 10 else today.year - 1

# Rosters roll over in July so offseason trades and free agency are assigned
# to the upcoming season before games and statistics exist for that season.
roster_season_start = today.year if today.month >= 7 else today.year - 1

# Environment overrides remain available for backfills or API edge cases.
SEASON = os.getenv("NBA_STATS_SEASON", season_label(stats_season_start))
PREV_SEASON = os.getenv(
    "NBA_PREV_SEASON",
    season_label(stats_season_start - 1),
)
ROSTER_SEASON = os.getenv(
    "NBA_ROSTER_SEASON",
    season_label(roster_season_start),
)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "src", "app", "data")
PIPELINE_ENV_FILE = os.path.join(os.path.dirname(__file__), ".env.pipeline")

SCHEDULE_DAYS_AHEAD = 2
NBA_SCHEDULE_TIMEZONE = ZoneInfo("America/New_York")
QA_SNAPSHOT_DATE = os.getenv("NBA_QA_DATE", "").strip()
STORAGE_MANIFEST_PATH = os.getenv("NBA_STORAGE_MANIFEST", "current.json").strip() or "current.json"
STORAGE_VERSION_ALIAS = os.getenv("NBA_STORAGE_VERSION", "").strip()
NBA_PROXY_URL = os.getenv("NBA_PROXY_URL", "").strip() or None
SLEEP_BETWEEN_REQUESTS = (1.0, 2.0)
REQUEST_TIMEOUT = 120
NBA_API_RETRIES = 3
NBA_API_RETRY_BASE_SLEEP = 20

ESPN_INJURIES_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries"
NBA_STATS_BASE_URL = "https://stats.nba.com/stats"

NBA_HEADERS = {
    "Host": "stats.nba.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "x-nba-stats-origin": "stats",
    "x-nba-stats-token": "true",
    "Origin": "https://www.nba.com",
    "Referer": "https://www.nba.com/",
    "Connection": "keep-alive",
}

# teamId → abbr
TEAM_ABBREV_MAP = {
    1610612737: "ATL", 1610612738: "BOS", 1610612739: "CLE", 1610612740: "NOP",
    1610612741: "CHI", 1610612742: "DAL", 1610612743: "DEN", 1610612744: "GSW",
    1610612745: "HOU", 1610612746: "LAC", 1610612747: "LAL", 1610612748: "MIA",
    1610612749: "MIL", 1610612750: "MIN", 1610612751: "BKN", 1610612752: "NYK",
    1610612753: "ORL", 1610612754: "IND", 1610612755: "PHI", 1610612756: "PHX",
    1610612757: "POR", 1610612758: "SAC", 1610612759: "SAS", 1610612760: "OKC",
    1610612761: "TOR", 1610612762: "UTA", 1610612763: "MEM", 1610612764: "WAS",
    1610612765: "DET", 1610612766: "CHA",
}

# ESPN display name → teamId (for injury parsing)
ESPN_TEAM_NAME_TO_ID = {
    "Atlanta Hawks": 1610612737,      "Boston Celtics": 1610612738,
    "Cleveland Cavaliers": 1610612739,"New Orleans Pelicans": 1610612740,
    "Chicago Bulls": 1610612741,      "Dallas Mavericks": 1610612742,
    "Denver Nuggets": 1610612743,     "Golden State Warriors": 1610612744,
    "Houston Rockets": 1610612745,    "LA Clippers": 1610612746,
    "Los Angeles Lakers": 1610612747, "Miami Heat": 1610612748,
    "Milwaukee Bucks": 1610612749,    "Minnesota Timberwolves": 1610612750,
    "Brooklyn Nets": 1610612751,      "New York Knicks": 1610612752,
    "Orlando Magic": 1610612753,      "Indiana Pacers": 1610612754,
    "Philadelphia 76ers": 1610612755, "Phoenix Suns": 1610612756,
    "Portland Trail Blazers": 1610612757, "Sacramento Kings": 1610612758,
    "San Antonio Spurs": 1610612759,  "Oklahoma City Thunder": 1610612760,
    "Toronto Raptors": 1610612761,    "Utah Jazz": 1610612762,
    "Memphis Grizzlies": 1610612763,  "Washington Wizards": 1610612764,
    "Detroit Pistons": 1610612765,    "Charlotte Hornets": 1610612766,
}

# Prop stat keys used throughout
ALL_PROP_STATS = ["pts", "reb", "ast", "stl", "blk", "tov", "fg3m", "pra", "pa", "pr", "ra"]

PLAYER_STATS_PARAMS = {
    "College": "",
    "Conference": "",
    "Country": "",
    "DateFrom": "",
    "DateTo": "",
    "Division": "",
    "DraftPick": "",
    "DraftYear": "",
    "GameScope": "",
    "GameSegment": "",
    "Height": "",
    "LastNGames": "0",
    "LeagueID": "00",
    "Location": "",
    "MeasureType": "Base",
    "Month": "0",
    "OpponentTeamID": "0",
    "Outcome": "",
    "PORound": "0",
    "PaceAdjust": "N",
    "PerMode": "Totals",
    "Period": "0",
    "PlayerExperience": "",
    "PlayerPosition": "",
    "PlusMinus": "N",
    "Rank": "N",
    "SeasonSegment": "",
    "SeasonType": "Regular Season",
    "ShotClockRange": "",
    "StarterBench": "",
    "TeamID": "0",
    "TwoWay": "",
    "VsConference": "",
    "VsDivision": "",
    "Weight": "",
}

# ============================================================
# HELPERS
# ============================================================

def save_json(data, filename):
    """Save minified JSON to OUTPUT_DIR."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        # separators=(',', ':') produces minified output
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    size_kb = os.path.getsize(path) / 1024
    print(f"  ✅ {filename} ({size_kb:.1f} KB)")

def load_pipeline_env():
    """Load the dedicated, gitignored cron environment without extra packages."""
    if not os.path.exists(PIPELINE_ENV_FILE):
        return
    with open(PIPELINE_ENV_FILE, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip('"').strip("'")
            if key.strip() and value:
                os.environ.setdefault(key.strip(), value)


def configure_runtime_from_env():
    """Refresh runtime options after .env.pipeline has been loaded."""
    global SEASON, PREV_SEASON, ROSTER_SEASON
    global QA_SNAPSHOT_DATE, STORAGE_MANIFEST_PATH, STORAGE_VERSION_ALIAS, NBA_PROXY_URL

    SEASON = os.getenv("NBA_STATS_SEASON", season_label(stats_season_start))
    PREV_SEASON = os.getenv(
        "NBA_PREV_SEASON",
        season_label(stats_season_start - 1),
    )
    ROSTER_SEASON = os.getenv(
        "NBA_ROSTER_SEASON",
        season_label(roster_season_start),
    )
    QA_SNAPSHOT_DATE = os.getenv("NBA_QA_DATE", "").strip()
    STORAGE_MANIFEST_PATH = os.getenv("NBA_STORAGE_MANIFEST", "current.json").strip() or "current.json"
    STORAGE_VERSION_ALIAS = os.getenv("NBA_STORAGE_VERSION", "").strip()
    NBA_PROXY_URL = os.getenv("NBA_PROXY_URL", "").strip() or None


def load_json(filename):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def py(v):
    """Convert numpy scalar to native Python type."""
    return v.item() if hasattr(v, "item") else v

def fix_nan(obj):
    """Recursively replace NaN with None."""
    if isinstance(obj, list):
        return [fix_nan(i) for i in obj]
    if isinstance(obj, dict):
        return {k: fix_nan(v) for k, v in obj.items()}
    if isinstance(obj, float) and math.isnan(obj):
        return None
    return obj

def random_sleep():
    time.sleep(random.uniform(*SLEEP_BETWEEN_REQUESTS))

def retry_request(label, fn, attempts=NBA_API_RETRIES):
    for attempt in range(1, attempts + 1):
        try:
            return fn()
        except Exception as error:
            if attempt == attempts:
                raise
            delay = NBA_API_RETRY_BASE_SLEEP * attempt
            print(f"  ⚠️ {label} failed on attempt {attempt}/{attempts}: {error}")
            print(f"  ↪ Retrying in {delay}s...")
            time.sleep(delay)

def nba_endpoint_kwargs():
    kwargs = {
        "headers": NBA_HEADERS,
        "timeout": REQUEST_TIMEOUT,
    }
    if NBA_PROXY_URL:
        kwargs["proxy"] = NBA_PROXY_URL
    return kwargs

def nba_proxy_mapping():
    if not NBA_PROXY_URL:
        return None
    return {"http": NBA_PROXY_URL, "https": NBA_PROXY_URL}

def nba_stats_get_json(endpoint, params):
    response = curl_requests.get(
        f"{NBA_STATS_BASE_URL}/{endpoint}",
        params=params,
        headers=NBA_HEADERS,
        impersonate="chrome",
        proxies=nba_proxy_mapping(),
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    return response.json()

def nba_result_set_dataframe(payload):
    result_sets = payload.get("resultSets") or payload.get("resultSet") or []
    if isinstance(result_sets, dict):
        result_set = result_sets
    elif result_sets:
        result_set = result_sets[0]
    else:
        return pd.DataFrame()

    headers = result_set.get("headers", [])
    rows = result_set.get("rowSet", [])
    return pd.DataFrame(rows, columns=headers)

def safe_round(val, digits=2):
    """Round only if val is a valid number."""
    try:
        return round(float(val), digits) if val is not None else None
    except (TypeError, ValueError):
        return None

def normalize_dob(dob_str):
    """
    Convert 'JUL 18, 1997' → '1997-07-18'.
    Returns original string on parse failure.
    """
    try:
        return datetime.strptime(dob_str, "%b %d, %Y").strftime("%Y-%m-%d")
    except Exception:
        return dob_str

def parse_opponent_from_matchup(matchup_str, player_team_abbr):
    """
    'BOS @ NYK' → 'NYK'
    'BOS vs. NYK' → 'NYK'
    Falls back to stripping the player's own team abbr.
    """
    if not matchup_str:
        return ""
    if " @ " in matchup_str:
        parts = matchup_str.split(" @ ")
    elif " vs. " in matchup_str:
        parts = matchup_str.split(" vs. ")
    else:
        return ""
    # The opponent is whichever part isn't the player's team
    for part in parts:
        abbr = part.strip()
        if abbr != player_team_abbr:
            return abbr
    return parts[-1].strip()

# ============================================================
# FETCH LAYER  (unchanged from original — just data collection)
# ============================================================

def fetch_raw_player_stats():
    print("\n📊 Fetching player stats (totals)...")
    df = retry_request(
        "Player stats",
        lambda: nba_result_set_dataframe(
            nba_stats_get_json(
                "leaguedashplayerstats",
                {**PLAYER_STATS_PARAMS, "Season": SEASON},
            ),
        ),
    )
    return df

def fetch_raw_team_stats():
    print("\n🏀 Fetching team stats (offense + defense)...")
    df_off = retry_request(
        "Team offense stats",
        lambda: leaguedashteamstats.LeagueDashTeamStats(
            season=SEASON, season_type_all_star="Regular Season",
            measure_type_detailed_defense="Base", per_mode_detailed="PerGame",
            rank="Y", **nba_endpoint_kwargs(),
        ).get_data_frames()[0],
    )
    random_sleep()
    df_def = retry_request(
        "Team defense stats",
        lambda: leaguedashteamstats.LeagueDashTeamStats(
            season=SEASON, season_type_all_star="Regular Season",
            measure_type_detailed_defense="Opponent", per_mode_detailed="PerGame",
            rank="Y", **nba_endpoint_kwargs(),
        ).get_data_frames()[0],
    )
    return df_off, df_def

def fetch_raw_game_logs(season, season_type="Regular Season"):
    print(f"\n🎮 Fetching {season_type.lower()} game logs ({season}) in 1 request...")
    df = retry_request(
        f"{season_type} game logs {season}",
        lambda: leaguegamelog.LeagueGameLog(
            season=season,
            season_type_all_star=season_type,
            player_or_team_abbreviation="P",
            **nba_endpoint_kwargs(),
        ).get_data_frames()[0],
    )
    print(f"  📦 {len(df)} total game log rows")
    return df

def fetch_raw_rosters():
    print("\n👥 Fetching rosters (one request per team)...")
    # raw_rosters: { teamId(int): [row_dict, ...] }
    raw_rosters = {}
    team_entries = list(TEAM_ABBREV_MAP.items())
    total = len(team_entries)
    for i, (team_id, team_abbr) in enumerate(team_entries):
        try:
            roster_df = retry_request(
                f"{team_abbr} roster",
                lambda: commonteamroster.CommonTeamRoster(
                    team_id=team_id, season=ROSTER_SEASON,
                    **nba_endpoint_kwargs(),
                ).get_data_frames()[0],
            )

            raw_rosters[team_id] = roster_df[[
                "PLAYER_ID", "PLAYER", "NUM", "POSITION", "HEIGHT", "WEIGHT", "BIRTH_DATE"
            ]].to_dict(orient="records")

            print(f"  [{i+1}/{total}] {team_abbr}: {len(roster_df)} players")
        except Exception as e:
            print(f"  ⚠️ Error for {team_abbr}: {e}")
            raw_rosters[team_id] = []
        random_sleep()

    return raw_rosters


def update_roster_files():
    """Refresh only offseason roster-related files."""
    print(f"🚀 Updating rosters for {ROSTER_SEASON}")
    raw_rosters = fetch_raw_rosters()
    if not any(raw_rosters.values()):
        raise RuntimeError("Roster update returned no players; existing files were preserved")

    save_json(fix_nan(build_players(raw_rosters)), "players.json")
    save_json(build_teams(), "teams.json")
    save_json(fix_nan(build_rosters(raw_rosters)), "rosters.json")

def parse_qa_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError as error:
        raise ValueError("NBA_QA_DATE must use YYYY-MM-DD format") from error


def fetch_raw_schedule():
    if QA_SNAPSHOT_DATE:
        qa_date = parse_qa_date(QA_SNAPSHOT_DATE)
        dates = [qa_date.strftime("%m/%d/%Y")]
        print(f"\n📅 Fetching QA schedule ({QA_SNAPSHOT_DATE})...")
    else:
        schedule_today = datetime.now(NBA_SCHEDULE_TIMEZONE)
        dates = [
            (schedule_today + timedelta(days=i)).strftime("%m/%d/%Y")
            for i in range(SCHEDULE_DAYS_AHEAD)
        ]
        print(f"\n📅 Fetching schedule (next {SCHEDULE_DAYS_AHEAD} days)...")

    all_games = []
    for date in dates:
        try:
            scoreboard = retry_request(
                f"Schedule {date}",
                lambda: scoreboardv2.ScoreboardV2(
                    game_date=date, league_id="00", day_offset=0,
                    **nba_endpoint_kwargs(),
                ),
            )
            games = scoreboard.get_normalized_dict()["GameHeader"]
            for game in games:
                all_games.append({
                    "date": game["GAME_DATE_EST"],
                    "visitor_team_id": game["VISITOR_TEAM_ID"],
                    "home_team_id": game["HOME_TEAM_ID"],
                    "status": game["GAME_STATUS_TEXT"],
                })
            print(f"  {date}: {len(games)} games")
        except Exception as e:
            print(f"  ⚠️ Error on {date}: {e}")
        random_sleep()

    # Deduplicate
    seen = set()
    unique = []
    for g in all_games:
        key = (g["date"], g["home_team_id"], g["visitor_team_id"])
        if key not in seen:
            seen.add(key)
            unique.append(g)
    return unique


def fetch_raw_standings():
    print(f"\n🏆 Fetching standings for {SEASON}...")
    return retry_request(
        "Standings",
        lambda: leaguestandings.LeagueStandings(
            league_id="00", season=SEASON,
            **nba_endpoint_kwargs(),
        ).get_data_frames()[0],
    )

def fetch_raw_injuries():
    print("\n🏥 Fetching injuries (ESPN)...")
    response = retry_request(
        "ESPN injuries",
        lambda: requests.get(ESPN_INJURIES_URL, timeout=30),
    )
    response.raise_for_status()
    return response.json()

# ============================================================
# BUILDERS  (raw data → optimized JSON shape)
# ============================================================

def build_players(raw_rosters):
    """
    players.json
    { "playerId": { name, num, pos, height, weight, dob } }
    No team info — that lives in rosters.json.
    """
    players = {}
    for team_id, roster in raw_rosters.items():
        for p in roster:
            pid = str(int(p["PLAYER_ID"]))
            weight = p.get("WEIGHT")
            if isinstance(weight, float) and math.isnan(weight):
                weight = None

            players[pid] = {
                "name":   p["PLAYER"],
                "num": None if (n := p.get("NUM")) is None or (isinstance(n, float) and math.isnan(n)) else str(n),
                "pos":    p.get("POSITION") or None,
                "height": p.get("HEIGHT") or None,
                "weight": str(weight) if weight is not None else None,
                "dob":    normalize_dob(p["BIRTH_DATE"]) if p.get("BIRTH_DATE") else None,
            }
    return players


def build_teams():
    """
    teams.json
    { "teamId": { name, abbr } }
    Static — derived from TEAM_ABBREV_MAP.
    Full team names come from ESPN_TEAM_NAME_TO_ID (reversed).
    """
    id_to_name = {v: k for k, v in ESPN_TEAM_NAME_TO_ID.items()}
    teams = {}
    for team_id, abbr in TEAM_ABBREV_MAP.items():
        teams[str(team_id)] = {
            "name": id_to_name.get(team_id, ""),
            "abbr": abbr,
        }
    return teams


def build_rosters(raw_rosters):
    """
    rosters.json
    { "teamId": [{ id, name, num, pos }] }
    Inline display fields to avoid cross-lookup with players.json in the UI.
    """
    rosters = {}
    for team_id, roster in raw_rosters.items():
        rosters[str(team_id)] = [
            {
                "id":   int(p["PLAYER_ID"]),
                "name": p["PLAYER"],
                "num": None if (n := p.get("NUM")) is None or (isinstance(n, float) and math.isnan(n)) else str(n),
                "pos":  p.get("POSITION") or None,
            }
            for p in roster
        ]
    return rosters


def build_season_stats(df_player_stats):
    """
    season_stats.json
    { "playerId": { gp, min, pts, reb, ast, stl, blk, tov, fg3m, fg_pct, fg3_pct, ft_pct } }
    All values are per-game averages. Computed here — frontend does zero math.
    """
    stats = {}
    for _, row in df_player_stats.iterrows():
        pid = str(int(row["PLAYER_ID"]))
        gp = int(row["GP"]) or 1  # guard against 0

        def avg(col, digits=1):
            return safe_round(float(row[col]) / gp, digits)

        stats[pid] = {
            "gp":      int(row["GP"]),
            "min":     avg("MIN", 1),
            "pts":     avg("PTS", 1),
            "reb":     avg("REB", 1),
            "ast":     avg("AST", 1),
            "stl":     avg("STL", 1),
            "blk":     avg("BLK", 1),
            "tov":     avg("TOV", 1),
            "fg3m":    avg("FG3M", 1),
            "fg_pct":  safe_round(float(row["FG_PCT"]), 3) if row["FG_PCT"] else 0.0,
            "fg3_pct": safe_round(float(row["FG3_PCT"]), 3) if row["FG3_PCT"] else 0.0,
            "ft_pct":  safe_round(float(row["FT_PCT"]), 3) if row["FT_PCT"] else 0.0,
        }
    return stats


def build_team_defense(df_off, df_def):
    """
    team_defense.json
    { "teamId": { pts, pts_rank, ast, ast_rank, reb, reb_rank, ... } }
    One entry per team. Frontend does: teamDefense[oppId].
    Replaces formatTeamStats() entirely.
    """
    defense = {}
    for _, def_row in df_def.iterrows():
        team_id = str(int(def_row["TEAM_ID"]))
        defense[team_id] = {
            "pts":      py(def_row["OPP_PTS"]),      "pts_rank":      py(def_row["OPP_PTS_RANK"]),
            "ast":      py(def_row["OPP_AST"]),      "ast_rank":      py(def_row["OPP_AST_RANK"]),
            "reb":      py(def_row["OPP_REB"]),      "reb_rank":      py(def_row["OPP_REB_RANK"]),
            "oreb":     py(def_row["OPP_OREB"]),     "oreb_rank":     py(def_row["OPP_OREB_RANK"]),
            "dreb":     py(def_row["OPP_DREB"]),     "dreb_rank":     py(def_row["OPP_DREB_RANK"]),
            "fg_pct":   py(def_row["OPP_FG_PCT"]),   "fg_pct_rank":   py(def_row["OPP_FG_PCT_RANK"]),
            "fg3_pct":  py(def_row["OPP_FG3_PCT"]),  "fg3_pct_rank":  py(def_row["OPP_FG3_PCT_RANK"]),
            "ft_pct":   py(def_row["OPP_FT_PCT"]),   "ft_pct_rank":   py(def_row["OPP_FT_PCT_RANK"]),
            "stl":      py(def_row["OPP_STL"]),      "stl_rank":      py(def_row["OPP_STL_RANK"]),
            "blk":      py(def_row["OPP_BLK"]),      "blk_rank":      py(def_row["OPP_BLK_RANK"]),
            "tov":      py(def_row["OPP_TOV"]),      "tov_rank":      py(def_row["OPP_TOV_RANK"]),
        }

    # Also build offense map keyed by teamId (used in page.tsx team stats panel)
    offense = {}
    for _, off_row in df_off.iterrows():
        team_id = str(int(off_row["TEAM_ID"]))
        offense[team_id] = {
            "pts":     py(off_row["PTS"]),     "pts_rank":     py(off_row["PTS_RANK"]),
            "ast":     py(off_row["AST"]),     "ast_rank":     py(off_row["AST_RANK"]),
            "reb":     py(off_row["REB"]),     "reb_rank":     py(off_row["REB_RANK"]),
            "oreb":    py(off_row["OREB"]),    "oreb_rank":    py(off_row["OREB_RANK"]),
            "dreb":    py(off_row["DREB"]),    "dreb_rank":    py(off_row["DREB_RANK"]),
            "fg_pct":  py(off_row["FG_PCT"]),  "fg_pct_rank":  py(off_row["FG_PCT_RANK"]),
            "fg3_pct": py(off_row["FG3_PCT"]), "fg3_pct_rank": py(off_row["FG3_PCT_RANK"]),
            "ft_pct":  py(off_row["FT_PCT"]),  "ft_pct_rank":  py(off_row["FT_PCT_RANK"]),
            "stl":     py(off_row["STL"]),     "stl_rank":     py(off_row["STL_RANK"]),
            "blk":     py(off_row["BLK"]),     "blk_rank":     py(off_row["BLK_RANK"]),
            "tov":     py(off_row["TOV"]),     "tov_rank":     py(off_row["TOV_RANK"]),
        }

    # Merge into a single file: { teamId: { offense: {...}, defense: {...} } }
    team_stats = {}
    all_ids = set(defense.keys()) | set(offense.keys())
    for tid in all_ids:
        team_stats[tid] = {
            "offense": offense.get(tid, {}),
            "defense": defense.get(tid, {}),
        }

    return team_stats


def build_game_logs(df_logs):
    """
    game_logs_current.json / game_logs_prev.json
    {
      "playerId": [{
        gid, date, opp, matchup, isHome, wl, min,
        pts, reb, ast, stl, blk, tov,
        fgm, fga, fg_pct, fg3m, fg3a, fg3_pct, ftm, fta, ft_pct,
        oreb, dreb, pf, plus_minus
      }]
    }
    Compact but frontend-complete. Keeps the lean keyed-by-player shape while
    preserving the shooting/context fields used by the player stats UI.
    Logs are sorted newest → oldest (consistent with L5/L10 window ordering).
    """
    grouped = defaultdict(list)

    for _, row in df_logs.iterrows():
        pid = str(int(row["PLAYER_ID"]))
        team_abbr = str(row["TEAM_ABBREVIATION"])
        matchup = str(row["MATCHUP"])
        opp = parse_opponent_from_matchup(matchup, team_abbr)

        grouped[pid].append({
            "gid":        str(row["GAME_ID"]),
            "date":       str(row["GAME_DATE"]),
            "opp":        opp,
            "matchup":    matchup,
            "isHome":     " vs. " in matchup,
            "wl":         str(row["WL"]) if row["WL"] is not None else None,
            "min":        py(row["MIN"]),
            "pts":        py(row["PTS"]),
            "reb":        py(row["REB"]),
            "ast":        py(row["AST"]),
            "stl":        py(row["STL"]),
            "blk":        py(row["BLK"]),
            "tov":        py(row["TOV"]),
            "fgm":        py(row["FGM"]),
            "fga":        py(row["FGA"]),
            "fg_pct":     py(row["FG_PCT"]),
            "fg3m":       py(row["FG3M"]),
            "fg3a":       py(row["FG3A"]),
            "fg3_pct":    py(row["FG3_PCT"]),
            "ftm":        py(row["FTM"]),
            "fta":        py(row["FTA"]),
            "ft_pct":     py(row["FT_PCT"]),
            "oreb":       py(row["OREB"]),
            "dreb":       py(row["DREB"]),
            "pf":         py(row["PF"]),
            "plus_minus": py(row["PLUS_MINUS"]),
        })

    # Sort each player's logs newest → oldest
    logs = {}
    for pid, games in grouped.items():
        logs[pid] = sorted(games, key=lambda g: g["date"], reverse=True)

    return fix_nan(logs)


def build_injuries(raw_espn):
    """
    injuries.json
    { "teamId": [{ pid, status, type, detail, returnDate }] }
    Stripped to the 5 fields the frontend actually uses.
    Frontend builds injuryMap[pid] in one line if needed.
    Replaces compactInjuryTeam() entirely.
    """
    injuries = {}

    for team_entry in raw_espn.get("injuries", []):
        team_name = team_entry.get("displayName", "").strip()
        team_id = ESPN_TEAM_NAME_TO_ID.get(team_name)

        if team_id is None:
            print(f"  ⚠️ No teamId for: {team_name}")
            continue

        tid_str = str(team_id)
        injuries[tid_str] = []

        for injury in team_entry.get("injuries", []):
            athlete = injury.get("athlete", {})

            # ESPN athlete IDs differ from NBA API player IDs.
            # We store ESPN's athlete ID here; the frontend must ensure
            # its playerId source matches. If you need NBA player IDs,
            # add a name→id lookup map from the roster data.
            pid = athlete.get("id") or athlete.get("uid", "").split("~a:")[-1]
            try:
                pid = int(pid)
            except (ValueError, TypeError):
                pid = None

            details = injury.get("details", {})
            return_date = details.get("returnDate") or None

            injuries[tid_str].append({
                "pid":        pid,
                "name":       athlete.get("displayName") or None,
                "status":     injury.get("status"),
                "type":       details.get("type") or None,
                "detail":     details.get("detail") or None,
                "returnDate": return_date,
            })

    return injuries


def build_standings(df_standings):
    """Keep the standings fields consumed by the app."""
    fields = [
        "LeagueID", "SeasonID", "TeamID", "TeamName", "Conference",
        "ConferenceRecord", "PlayoffRank", "WINS", "LOSSES", "WinPCT",
        "LeagueRank", "Record", "HOME", "ROAD", "L10",
        "Last10Home", "Last10Road",
    ]
    return [
        {field: py(row[field]) for field in fields if field in row.index}
        for _, row in df_standings.iterrows()
    ]


def update_live_files():
    """Refresh lightweight schedule, injury and standings datasets."""
    schedule = fetch_raw_schedule()
    injuries = build_injuries(fetch_raw_injuries())
    standings = build_standings(fetch_raw_standings())
    save_json(fix_nan(schedule), "schedule.json")
    save_json(fix_nan(injuries), "injuries.json")
    save_json(fix_nan(standings), "standings.json")


def build_props(schedule, raw_rosters, df_player_stats, df_current_logs):
    """
    props.json
    {
      "playerId": {
        "oppId": 1610612743,
        "props": {
          "pts": { "avg": 31.1, "l5": 40, "l10": 30, "l20": 45, "season": 41, "h2h": 100 },
          ...
        }
      }
    }

    - Only players with a game today/tomorrow are included.
    - No player name, team, date, position — all stripped.
    - No "games" field anywhere (windows are implicit: l5=5, l10=10, etc.)
    - All averages precomputed here. Frontend does zero math.
    """

    # ── Build schedule lookup: teamId → opponent teamId ──
    game_map = {}  # teamId → opponent_team_id
    for game in schedule:
        home = game["home_team_id"]
        away = game["visitor_team_id"]
        game_map[home] = away
        game_map[away] = home

    scheduled_team_ids = set(game_map.keys())

    # ── Stats lookup: playerId → row ──
    stats_map = {int(row["PLAYER_ID"]): row for _, row in df_player_stats.iterrows()}

    # ── Game logs lookup: playerId → [enriched log dicts] (newest → oldest) ──
    # Enrich with short keys and derived combos for hit rate calculation.
    logs_by_player = defaultdict(list)
    for _, row in df_current_logs.sort_values("GAME_DATE", ascending=False).iterrows():
        pid = int(row["PLAYER_ID"])
        team_abbr = str(row["TEAM_ABBREVIATION"])
        opp = parse_opponent_from_matchup(str(row["MATCHUP"]), team_abbr)

        pts  = float(row["PTS"]  or 0)
        reb  = float(row["REB"]  or 0)
        ast  = float(row["AST"]  or 0)
        stl  = float(row["STL"]  or 0)
        blk  = float(row["BLK"]  or 0)
        tov  = float(row["TOV"]  or 0)
        fg3m = float(row["FG3M"] or 0)

        logs_by_player[pid].append({
            "opp":  opp,
            "pts":  pts,
            "reb":  reb,
            "ast":  ast,
            "stl":  stl,
            "blk":  blk,
            "tov":  tov,
            "fg3m": fg3m,
            "pra":  pts + reb + ast,
            "pa":   pts + ast,
            "pr":   pts + reb,
            "ra":   reb + ast,
        })

    def hit_rate(games, stat_key, avg):
        """Percentage of games where player met or exceeded avg. Returns None if no data."""
        if not games or avg is None or avg <= 0:
            return None
        hits = sum(1 for g in games if (g.get(stat_key) or 0) >= avg)
        return round(hits / len(games) * 100)

    result = {}

    # Flatten roster: playerId → teamId
    player_team_map = {}
    for team_id, roster in raw_rosters.items():
        for p in roster:
            player_team_map[int(p["PLAYER_ID"])] = team_id

    for player_id, team_id in player_team_map.items():
        # Only include players with a game scheduled
        if team_id not in scheduled_team_ids:
            continue

        opponent_id = game_map.get(team_id)
        player_stats = stats_map.get(player_id)
        if player_stats is None:
            continue

        gp = int(player_stats["GP"]) or 1

        # ── Precompute per-game averages ──
        def pg(col):
            return float(player_stats[col] or 0) / gp

        avgs = {
            "pts":  round(pg("PTS"), 2),
            "reb":  round(pg("REB"), 2),
            "ast":  round(pg("AST"), 2),
            "stl":  round(pg("STL"), 2),
            "blk":  round(pg("BLK"), 2),
            "tov":  round(pg("TOV"), 2),
            "fg3m": round(pg("FG3M"), 2),
        }
        avgs["pra"] = round(avgs["pts"] + avgs["reb"] + avgs["ast"], 2)
        avgs["pa"]  = round(avgs["pts"] + avgs["ast"], 2)
        avgs["pr"]  = round(avgs["pts"] + avgs["reb"], 2)
        avgs["ra"]  = round(avgs["reb"] + avgs["ast"], 2)

        logs = logs_by_player.get(player_id, [])
        opp_abbr = TEAM_ABBREV_MAP.get(opponent_id, "")

        l5   = logs[:5]
        l10  = logs[:10]
        l20  = logs[:20]
        full = logs
        h2h  = [g for g in logs if g.get("opp") == opp_abbr]

        # ── Build props per stat ──
        # Skip stats where avg is 0 or negative (player doesn't contribute)
        NON_ZERO_STATS = {"pts", "reb", "ast", "stl", "blk", "fg3m", "pra", "pa", "pr", "ra"}
        props = {}

        for stat in ALL_PROP_STATS:
            avg = avgs.get(stat)
            if avg is None:
                continue
            if avg <= 0 and stat in NON_ZERO_STATS:
                continue

            props[stat] = {
                "avg":    avg,
                "l5":     hit_rate(l5,   stat, avg),
                "l10":    hit_rate(l10,  stat, avg),
                "l20":    hit_rate(l20,  stat, avg),
                "season": hit_rate(full, stat, avg),
                "h2h":    hit_rate(h2h,  stat, avg),
                "l5Games": len(l5),
                "l10Games": len(l10),
                "l20Games": len(l20),
                "seasonGames": len(full),
                "h2hGames": len(h2h),
            }

        if not props:
            continue

        result[str(player_id)] = {
            "oppId": opponent_id,
            "props": props,
        }

    return fix_nan(result)


def storage_config():
    load_pipeline_env()
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    secret = os.getenv("SUPABASE_SECRET_KEY", "")
    bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "")
    if not url or not secret or not bucket:
        raise RuntimeError("SUPABASE_URL, SUPABASE_SECRET_KEY and SUPABASE_STORAGE_BUCKET are required")
    return url, secret, bucket


def upload_storage_json(path, data, config):
    url, secret, bucket = config
    response = requests.post(
        f"{url}/storage/v1/object/{bucket}/{path}",
        headers={
            "apikey": secret,
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
            "x-upsert": "true",
        },
        data=json.dumps(data, separators=(",", ":"), ensure_ascii=False).encode("utf-8"),
        timeout=REQUEST_TIMEOUT,
    )
    if not response.ok:
        raise RuntimeError(f"Storage upload failed for {path}: HTTP {response.status_code} {response.text[:200]}")


def download_storage_json(path, config):
    url, secret, bucket = config
    response = requests.get(
        f"{url}/storage/v1/object/{bucket}/{path}",
        headers={"apikey": secret, "Authorization": f"Bearer {secret}"},
        timeout=30,
    )
    if not response.ok:
        raise RuntimeError(f"Storage validation failed for {path}: HTTP {response.status_code}")
    return response.json()


def list_storage_entries(prefix, config):
    url, secret, bucket = config
    entries = []
    offset = 0
    while True:
        response = requests.post(
            f"{url}/storage/v1/object/list/{bucket}",
            headers={
                "apikey": secret,
                "Authorization": f"Bearer {secret}",
                "Content-Type": "application/json",
            },
            json={
                "prefix": prefix,
                "limit": 1000,
                "offset": offset,
                "sortBy": {"column": "name", "order": "asc"},
            },
            timeout=30,
        )
        if not response.ok:
            raise RuntimeError(f"Storage list failed for {prefix}: HTTP {response.status_code}")
        page = response.json()
        entries.extend(page)
        if len(page) < 1000:
            return entries
        offset += len(page)


def collect_storage_files(prefix, config):
    files = []
    for entry in list_storage_entries(prefix, config):
        path = f"{prefix}/{entry['name']}"
        if entry.get("id") is None:
            files.extend(collect_storage_files(path, config))
        else:
            files.append(path)
    return files


def delete_storage_files(paths, config):
    if not paths:
        return
    url, secret, bucket = config
    for start in range(0, len(paths), 1000):
        response = requests.delete(
            f"{url}/storage/v1/object/{bucket}",
            headers={
                "apikey": secret,
                "Authorization": f"Bearer {secret}",
                "Content-Type": "application/json",
            },
            json={"prefixes": paths[start:start + 1000]},
            timeout=REQUEST_TIMEOUT,
        )
        if not response.ok:
            raise RuntimeError(f"Storage delete failed: HTTP {response.status_code}")


def prune_storage_versions(config, keep=3):
    versions = sorted(
        (entry["name"] for entry in list_storage_entries("versions", config)),
        reverse=True,
    )
    obsolete = versions[keep:]
    if not obsolete:
        print(f"🧹 Storage retention: {len(versions)} version(s), nothing to remove")
        return
    for version in obsolete:
        paths = collect_storage_files(f"versions/{version}", config)
        delete_storage_files(paths, config)
        print(f"🧹 Removed old Storage version {version} ({len(paths)} objects)")


def publish_storage_version(datasets):
    config = storage_config()
    if STORAGE_VERSION_ALIAS:
        version = STORAGE_VERSION_ALIAS
    elif QA_SNAPSHOT_DATE:
        version = f"qa-{QA_SNAPSHOT_DATE}"
    else:
        version = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    prefix = f"versions/{version}"
    current_logs = datasets["game_logs_current"]
    previous_logs = datasets["game_logs_prev"]
    playoff_logs = datasets["game_logs_playoffs"]
    roster_player_ids = {
        str(player["id"])
        for roster in datasets["rosters"].values()
        for player in roster
        if player.get("id") is not None
    }
    player_ids = sorted(
        roster_player_ids | set(current_logs) | set(previous_logs) | set(playoff_logs),
    )

    small_datasets = {
        "players.json": datasets["players"],
        "teams.json": datasets["teams"],
        "rosters.json": datasets["rosters"],
        "season_stats.json": datasets["season_stats"],
        "props.json": datasets["props"],
        "team_stats.json": datasets["team_stats"],
        "injuries.json": datasets["injuries"],
        "schedule.json": datasets["schedule"],
        "standings.json": datasets["standings"],
    }
    for filename, data in small_datasets.items():
        upload_storage_json(f"{prefix}/{filename}", data, config)

    def upload_player(player_id):
        upload_storage_json(
            f"{prefix}/players/{player_id}.json",
            {
                "current": current_logs.get(player_id, []),
                "previous": previous_logs.get(player_id, []),
                "playoffs": playoff_logs.get(player_id, []),
            },
            config,
        )
        return player_id

    print(f"\n☁️  Uploading {len(player_ids)} player files to Storage...")
    completed = 0
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(upload_player, player_id) for player_id in player_ids]
        for future in as_completed(futures):
            future.result()
            completed += 1
            if completed % 50 == 0 or completed == len(player_ids):
                print(f"  [{completed}/{len(player_ids)}] players uploaded")

    manifest = {
        "version": version,
        "updatedAt": datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "playerCount": len(player_ids),
        "files": sorted(small_datasets),
        "manifest": STORAGE_MANIFEST_PATH,
    }
    if QA_SNAPSHOT_DATE:
        manifest["qaDate"] = QA_SNAPSHOT_DATE
        manifest["sourceSeason"] = SEASON
    upload_storage_json(f"{prefix}/manifest.json", manifest, config)
    upload_storage_json(STORAGE_MANIFEST_PATH, manifest, config)
    validated = download_storage_json(STORAGE_MANIFEST_PATH, config)
    if validated.get("version") != version or validated.get("playerCount") != len(player_ids):
        raise RuntimeError("Published Storage manifest did not pass validation")
    print(f"✅ Storage version published: {version} ({STORAGE_MANIFEST_PATH})")
    if STORAGE_MANIFEST_PATH == "current.json":
        try:
            prune_storage_versions(config, keep=3)
        except Exception as error:
            # Publication is already valid and active. Retention can safely retry on
            # the next run without making today's fresh data unavailable.
            print(f"⚠️ Storage retention failed: {error}")
    else:
        print("ℹ️ Storage retention skipped for non-production manifest")
    return manifest


# ============================================================
# PIPELINE ORCHESTRATOR
# ============================================================

def run():
    load_pipeline_env()
    configure_runtime_from_env()
    start = datetime.now()
    write_local_data = os.getenv("NBA_WRITE_LOCAL_DATA", "false").lower() == "true"
    print(f"🚀 NBA data pipeline — {start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Season: {SEASON} | Prev: {PREV_SEASON}")
    if QA_SNAPSHOT_DATE:
        print(f"   QA snapshot date: {QA_SNAPSHOT_DATE}")
    print(f"   Storage manifest: {STORAGE_MANIFEST_PATH}")
    print(f"   Local JSON fallback updates: {'enabled' if write_local_data else 'disabled'}")

    # ── 1. Fetch all raw data ──────────────────────────────────────────────
    df_player_stats       = fetch_raw_player_stats();     random_sleep()
    df_off, df_def        = fetch_raw_team_stats();       random_sleep()
    raw_rosters           = fetch_raw_rosters()           # has its own sleep
    schedule              = fetch_raw_schedule()          # has its own sleep
    df_standings          = fetch_raw_standings();        random_sleep()
    raw_injuries          = fetch_raw_injuries();         random_sleep()
    df_logs_current       = fetch_raw_game_logs(SEASON);  random_sleep()
    df_logs_prev          = fetch_raw_game_logs(PREV_SEASON); random_sleep()
    df_logs_playoffs      = fetch_raw_game_logs(SEASON, "Playoffs")

    # ── 2. Build + save each output file ──────────────────────────────────
    print("\n💾 Building output files...")

    # players.json
    players = build_players(raw_rosters)
    if write_local_data: save_json(fix_nan(players), "players.json")

    # teams.json
    teams = build_teams()
    if write_local_data: save_json(teams, "teams.json")

    # rosters.json
    rosters = build_rosters(raw_rosters)
    if write_local_data: save_json(fix_nan(rosters), "rosters.json")

    # season_stats.json
    season_stats = build_season_stats(df_player_stats)
    if write_local_data: save_json(fix_nan(season_stats), "season_stats.json")

    # team_defense.json  (now also includes offense for the team stats panel)
    team_stats = build_team_defense(df_off, df_def)
    if write_local_data: save_json(fix_nan(team_stats), "team_stats.json")

    # injuries.json
    injuries = build_injuries(raw_injuries)
    if write_local_data: save_json(injuries, "injuries.json")

    # schedule.json / standings.json
    if write_local_data:
        save_json(fix_nan(schedule), "schedule.json")
        save_json(fix_nan(build_standings(df_standings)), "standings.json")

    # Logs are kept in memory only and published per player to private Storage.
    # Writing them into src/app/data would put ~16 MB back into the Next build.
    logs_current = build_game_logs(df_logs_current)
    logs_prev = build_game_logs(df_logs_prev)
    logs_playoffs = build_game_logs(df_logs_playoffs)

    # props.json  (depends on schedule + rosters + stats + current logs)
    props = build_props(schedule, raw_rosters, df_player_stats, df_logs_current)
    if write_local_data: save_json(props, "props.json")

    # Publish only after every local dataset has been built successfully. The
    # current.json pointer is updated last by publish_storage_version(), so an
    # incomplete run can never become the active version.
    publish_storage_version({
        "players": fix_nan(players),
        "teams": teams,
        "rosters": fix_nan(rosters),
        "season_stats": fix_nan(season_stats),
        "props": props,
        "team_stats": fix_nan(team_stats),
        "injuries": injuries,
        "schedule": fix_nan(schedule),
        "standings": fix_nan(build_standings(df_standings)),
        "game_logs_current": logs_current,
        "game_logs_prev": logs_prev,
        "game_logs_playoffs": logs_playoffs,
    })

    elapsed = (datetime.now() - start).total_seconds()
    print(f"\n✅ Done in {elapsed:.1f}s ({elapsed / 60:.1f} min)")
    print("   Active data source: Supabase Storage")


# ============================================================
# OPTIONAL: Cleanup API call (unchanged from original)
# ============================================================

def run_cleanup():
    cleanup_url = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    if cleanup_url.startswith("http://localhost"):
        print("ℹ️ Favorites cleanup skipped: no deployed app URL configured")
        return
    try:
        cleanup_secret = os.getenv("CLEANUP_SECRET", "")
        r = requests.delete(
            f"{cleanup_url}/api/favorites/cleanup",
            headers={"Authorization": f"Bearer {cleanup_secret}"},
            timeout=10,
        )
        print(f"🧹 Cleanup: {r.json()}")
    except Exception as e:
        print(f"⚠️ Cleanup failed: {e}")


if __name__ == "__main__":
    run()
    run_cleanup()
