"""
pipeline.py
===========
Pipeline unificado para gerar todos os JSONs otimizados para a NBA app.
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

Dependências:
  pip install nba_api requests pandas
"""

import json
import math
import os
import time
import random
import requests
from datetime import datetime, timedelta
from collections import defaultdict

from nba_api.stats.endpoints import (
    leaguedashplayerstats,
    leaguegamelog,
    leaguedashteamstats,
    scoreboardv2,
    leaguestandings,
    commonteamroster,
)

# ============================================================
# CONFIG
# ============================================================

SEASON = "2025-26"
PREV_SEASON = "2024-25"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "src", "app", "data")

SCHEDULE_DAYS_AHEAD = 2
SLEEP_BETWEEN_REQUESTS = (1.0, 2.0)
REQUEST_TIMEOUT = 120

ESPN_INJURIES_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries"

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
    df = leaguedashplayerstats.LeagueDashPlayerStats(
        season=SEASON,
        season_type_all_star="Regular Season",
        per_mode_detailed="Totals",
        headers=NBA_HEADERS,
        timeout=REQUEST_TIMEOUT,
    ).get_data_frames()[0]
    return df

def fetch_raw_team_stats():
    print("\n🏀 Fetching team stats (offense + defense)...")
    df_off = leaguedashteamstats.LeagueDashTeamStats(
        season=SEASON, season_type_all_star="Regular Season",
        measure_type_detailed_defense="Base", per_mode_detailed="PerGame",
        rank="Y", headers=NBA_HEADERS, timeout=REQUEST_TIMEOUT,
    ).get_data_frames()[0]
    random_sleep()
    df_def = leaguedashteamstats.LeagueDashTeamStats(
        season=SEASON, season_type_all_star="Regular Season",
        measure_type_detailed_defense="Opponent", per_mode_detailed="PerGame",
        rank="Y", headers=NBA_HEADERS, timeout=REQUEST_TIMEOUT,
    ).get_data_frames()[0]
    return df_off, df_def

def fetch_raw_game_logs(season):
    print(f"\n🎮 Fetching all game logs ({season}) in 1 request...")
    df = leaguegamelog.LeagueGameLog(
        season=season,
        season_type_all_star="Regular Season",
        player_or_team_abbreviation="P",
        headers=NBA_HEADERS,
        timeout=REQUEST_TIMEOUT,
    ).get_data_frames()[0]
    print(f"  📦 {len(df)} total game log rows")
    return df

def fetch_raw_rosters():
    print("\n👥 Fetching rosters (one request per team)...")
    df_teams = leaguestandings.LeagueStandings(
        league_id="00", season=SEASON,
        headers=NBA_HEADERS, timeout=REQUEST_TIMEOUT,
    ).get_data_frames()[0][["TeamID", "TeamName"]]

    # raw_rosters: { teamId(int): [row_dict, ...] }
    raw_rosters = {}
    total = len(df_teams)
    for i, (_, row) in enumerate(df_teams.iterrows()):
        team_id = int(row["TeamID"])
        team_name = row["TeamName"]
        try:
            roster_df = commonteamroster.CommonTeamRoster(
                team_id=team_id, season=SEASON,
                headers=NBA_HEADERS, timeout=REQUEST_TIMEOUT,
            ).get_data_frames()[0]

            raw_rosters[team_id] = roster_df[[
                "PLAYER_ID", "PLAYER", "NUM", "POSITION", "HEIGHT", "WEIGHT", "BIRTH_DATE"
            ]].to_dict(orient="records")

            print(f"  [{i+1}/{total}] {team_name}: {len(roster_df)} players")
        except Exception as e:
            print(f"  ⚠️ Error for {team_name}: {e}")
            raw_rosters[team_id] = []
        random_sleep()

    return raw_rosters

def fetch_raw_schedule():
    print(f"\n📅 Fetching schedule (next {SCHEDULE_DAYS_AHEAD} days)...")
    all_games = []
    for i in range(SCHEDULE_DAYS_AHEAD):
        date = (datetime.today() + timedelta(days=i)).strftime("%m/%d/%Y")
        try:
            scoreboard = scoreboardv2.ScoreboardV2(
                game_date=date, league_id="00", day_offset=0,
                headers=NBA_HEADERS, timeout=REQUEST_TIMEOUT,
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

def fetch_raw_injuries():
    print("\n🏥 Fetching injuries (ESPN)...")
    response = requests.get(ESPN_INJURIES_URL, timeout=15)
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
    { "playerId": [{ gid, date, opp, pts, reb, ast, stl, blk, tov, min }] }
    Minimal. No player name, team, shooting splits, or metadata.
    Logs are sorted newest → oldest (consistent with L5/L10 window ordering).
    """
    grouped = defaultdict(list)

    for _, row in df_logs.iterrows():
        pid = str(int(row["PLAYER_ID"]))
        team_abbr = str(row["TEAM_ABBREVIATION"])
        opp = parse_opponent_from_matchup(str(row["MATCHUP"]), team_abbr)

        grouped[pid].append({
            "gid":  str(row["GAME_ID"]),
            "date": str(row["GAME_DATE"]),
            "opp":  opp,
            "min":  py(row["MIN"]),
            "pts":  py(row["PTS"]),
            "reb":  py(row["REB"]),
            "ast":  py(row["AST"]),
            "stl":  py(row["STL"]),
            "blk":  py(row["BLK"]),
            "tov":  py(row["TOV"]),
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
                "status":     injury.get("status"),
                "type":       details.get("type") or None,
                "detail":     details.get("detail") or None,
                "returnDate": return_date,
            })

    return injuries


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
            }

        if not props:
            continue

        result[str(player_id)] = {
            "oppId": opponent_id,
            "props": props,
        }

    return fix_nan(result)


# ============================================================
# PIPELINE ORCHESTRATOR
# ============================================================

def run():
    start = datetime.now()
    print(f"🚀 NBA data pipeline — {start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Season: {SEASON} | Prev: {PREV_SEASON}")
    print(f"   Output: {OUTPUT_DIR}")

    # ── 1. Fetch all raw data ──────────────────────────────────────────────
    df_player_stats       = fetch_raw_player_stats();     random_sleep()
    df_off, df_def        = fetch_raw_team_stats();       random_sleep()
    raw_rosters           = fetch_raw_rosters()           # has its own sleep
    schedule              = fetch_raw_schedule()          # has its own sleep
    raw_injuries          = fetch_raw_injuries();         random_sleep()
    df_logs_current       = fetch_raw_game_logs(SEASON);  random_sleep()
    df_logs_prev          = fetch_raw_game_logs(PREV_SEASON)

    # ── 2. Build + save each output file ──────────────────────────────────
    print("\n💾 Building output files...")

    # players.json
    players = build_players(raw_rosters)
    save_json(fix_nan(players), "players.json")

    # teams.json
    teams = build_teams()
    save_json(teams, "teams.json")

    # rosters.json
    rosters = build_rosters(raw_rosters)
    save_json(fix_nan(rosters), "rosters.json")

    # season_stats.json
    season_stats = build_season_stats(df_player_stats)
    save_json(fix_nan(season_stats), "season_stats.json")

    # team_defense.json  (now also includes offense for the team stats panel)
    team_stats = build_team_defense(df_off, df_def)
    save_json(fix_nan(team_stats), "team_stats.json")

    # injuries.json
    injuries = build_injuries(raw_injuries)
    save_json(injuries, "injuries.json")

    # game_logs_current.json
    logs_current = build_game_logs(df_logs_current)
    save_json(logs_current, "game_logs_current.json")

    # game_logs_prev.json
    logs_prev = build_game_logs(df_logs_prev)
    save_json(logs_prev, "game_logs_prev.json")

    # props.json  (depends on schedule + rosters + stats + current logs)
    props = build_props(schedule, raw_rosters, df_player_stats, df_logs_current)
    save_json(props, "props.json")

    elapsed = (datetime.now() - start).total_seconds()
    print(f"\n✅ Done in {elapsed:.1f}s ({elapsed / 60:.1f} min)")
    print(f"   Files written to: {OUTPUT_DIR}")


# ============================================================
# OPTIONAL: Cleanup API call (unchanged from original)
# ============================================================

def run_cleanup():
    try:
        cleanup_url = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
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