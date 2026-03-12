"""
update_data.py
==============
Script unificado para atualizar todos os JSONs de dados NBA.
Corre 1x por dia via GitHub Actions.

Gera os seguintes ficheiros em OUTPUT_DIR:
  - nba_active_players_stats.json
  - nba_active_players_game_logs.json
  - nba_team_stats.json
  - nba_games_schedule.json
  - nba_standings.json
  - nba_rosters.json
  - nba_injuries.json  (via ESPN API)

Dependências:
  pip install nba_api requests pandas
"""

import json
import os
import time
import requests
from datetime import datetime, timedelta

from nba_api.stats.endpoints import (
    leaguedashplayerstats,
    playergamelog,
    leaguedashteamstats,
    scoreboardv2,
    leaguestandings,
    commonteamroster,
)
from nba_api.stats.static import players as nba_players_static

# ============================================================
# CONFIG
# ============================================================

SEASON = "2025-26"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "src", "app", "data")

# Número de dias de jogos a buscar para o schedule (hoje + próximos N dias)
SCHEDULE_DAYS_AHEAD = 7

# Pausa entre requests para não sobrecarregar a NBA API
SLEEP_BETWEEN_REQUESTS = 0.6

# ESPN injuries URL
ESPN_INJURIES_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries"

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

TEAM_NAME_TO_ID = {v: k for k, v in {
    1610612737: "Atlanta Hawks",    1610612738: "Boston Celtics",
    1610612739: "Cleveland Cavaliers", 1610612740: "New Orleans Pelicans",
    1610612741: "Chicago Bulls",    1610612742: "Dallas Mavericks",
    1610612743: "Denver Nuggets",   1610612744: "Golden State Warriors",
    1610612745: "Houston Rockets",  1610612746: "LA Clippers",
    1610612747: "Los Angeles Lakers", 1610612748: "Miami Heat",
    1610612749: "Milwaukee Bucks",  1610612750: "Minnesota Timberwolves",
    1610612751: "Brooklyn Nets",    1610612752: "New York Knicks",
    1610612753: "Orlando Magic",    1610612754: "Indiana Pacers",
    1610612755: "Philadelphia 76ers", 1610612756: "Phoenix Suns",
    1610612757: "Portland Trail Blazers", 1610612758: "Sacramento Kings",
    1610612759: "San Antonio Spurs", 1610612760: "Oklahoma City Thunder",
    1610612761: "Toronto Raptors",  1610612762: "Utah Jazz",
    1610612763: "Memphis Grizzlies", 1610612764: "Washington Wizards",
    1610612765: "Detroit Pistons",  1610612766: "Charlotte Hornets",
}.items()}

# ============================================================
# HELPERS
# ============================================================

def save_json(data, filename):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  ✅ Guardado: {filename} ({len(data) if isinstance(data, list) else '...'} entradas)")

def py(v):
    """Converte numpy types para Python nativos."""
    return v.item() if hasattr(v, "item") else v

# ============================================================
# 1. PLAYER STATS (temporada atual, todos os jogadores)
# ============================================================

def fetch_player_stats():
    print("\n📊 A buscar player stats...")

    # leaguedashplayerstats devolve todos os jogadores de uma vez (muito mais eficiente)
    endpoint = leaguedashplayerstats.LeagueDashPlayerStats(
        season=SEASON,
        season_type_all_star="Regular Season",
        per_mode_detailed="Totals",  # totais como nos JSONs atuais
    )
    df = endpoint.get_data_frames()[0]

    result = []
    for _, row in df.iterrows():
        result.append({
            "player_id": int(row["PLAYER_ID"]),
            "name": row["PLAYER_NAME"],
            "season": SEASON,
            "team": row["TEAM_ABBREVIATION"],
            "games": int(row["GP"]),
            "points": float(row["PTS"]),
            "rebounds": float(row["REB"]),
            "assists": float(row["AST"]),
            "steals": float(row["STL"]),
            "blocks": float(row["BLK"]),
            "fg_pct": round(float(row["FG_PCT"]), 3) if row["FG_PCT"] else 0.0,
            "fg3_pct": round(float(row["FG3_PCT"]), 3) if row["FG3_PCT"] else 0.0,
            "ft_pct": round(float(row["FT_PCT"]), 3) if row["FT_PCT"] else 0.0,
            "turnovers": float(row["TOV"]),
            "minutes": float(row["MIN"]),
        })

    save_json(result, "nba_active_players_stats.json")

# ============================================================
# 2. PLAYER GAME LOGS (todos os jogadores ativos)
# ============================================================

def fetch_player_game_logs():
    print("\n🎮 A buscar player game logs (pode demorar ~5 min)...")

    active_players = nba_players_static.get_active_players()
    all_logs = []
    total = len(active_players)

    for i, player in enumerate(active_players):
        player_id = player["id"]
        player_name = player["full_name"]

        try:
            gamelog = playergamelog.PlayerGameLog(
                player_id=player_id,
                season=SEASON,
                season_type_all_star="Regular Season",
            )
            result_set = gamelog.get_dict()["resultSets"][0]
            headers = result_set["headers"]
            rows = result_set["rowSet"]

            all_logs.append({
                "player_name": player_name,
                "player_id": player_id,
                "team": rows[0][2] if rows else None,
                "games": [dict(zip(headers, row)) for row in rows],
            })

            print(f"  [{i+1}/{total}] {player_name}: {len(rows)} jogos")

        except Exception as e:
            print(f"  ⚠️ Erro em {player_name}: {e}")

        time.sleep(SLEEP_BETWEEN_REQUESTS)

    save_json(all_logs, "nba_active_players_game_logs.json")

# ============================================================
# 3. TEAM STATS (ofensivas + defensivas com rankings)
# ============================================================

def fetch_team_stats():
    print("\n🏀 A buscar team stats...")

    df_off = leaguedashteamstats.LeagueDashTeamStats(
        season=SEASON,
        season_type_all_star="Regular Season",
        measure_type_detailed_defense="Base",
        per_mode_detailed="PerGame",
        rank="Y",
    ).get_data_frames()[0]

    df_def = leaguedashteamstats.LeagueDashTeamStats(
        season=SEASON,
        season_type_all_star="Regular Season",
        measure_type_detailed_defense="Opponent",
        per_mode_detailed="PerGame",
        rank="Y",
    ).get_data_frames()[0]

    teams = []
    for _, row in df_off.iterrows():
        team_id = int(row["TEAM_ID"])
        def_row = df_def[df_def["TEAM_ID"] == team_id].iloc[0]

        teams.append({
            "TEAM_ID": team_id,
            "TEAM_NAME": row["TEAM_NAME"],
            "offense": {
                "PTS": py(row["PTS"]),       "PTS_RANK": py(row["PTS_RANK"]),
                "AST": py(row["AST"]),       "AST_RANK": py(row["AST_RANK"]),
                "REB": py(row["REB"]),       "REB_RANK": py(row["REB_RANK"]),
                "OREB": py(row["OREB"]),     "OREB_RANK": py(row["OREB_RANK"]),
                "DREB": py(row["DREB"]),     "DREB_RANK": py(row["DREB_RANK"]),
                "FG_PCT": py(row["FG_PCT"]), "FG_PCT_RANK": py(row["FG_PCT_RANK"]),
                "FG3_PCT": py(row["FG3_PCT"]),"FG3_PCT_RANK": py(row["FG3_PCT_RANK"]),
                "FG2_PCT": py(row["FG_PCT"]), "FG2_PCT_RANK": py(row["FG_PCT_RANK"]),
            },
            "defense": {
                "OPP_PTS": py(def_row["OPP_PTS"]),         "OPP_PTS_RANK": py(def_row["OPP_PTS_RANK"]),
                "OPP_AST": py(def_row["OPP_AST"]),         "OPP_AST_RANK": py(def_row["OPP_AST_RANK"]),
                "OPP_REB": py(def_row["OPP_REB"]),         "OPP_REB_RANK": py(def_row["OPP_REB_RANK"]),
                "OPP_OREB": py(def_row["OPP_OREB"]),       "OPP_OREB_RANK": py(def_row["OPP_OREB_RANK"]),
                "OPP_DREB": py(def_row["OPP_DREB"]),       "OPP_DREB_RANK": py(def_row["OPP_DREB_RANK"]),
                "OPP_FG_PCT": py(def_row["OPP_FG_PCT"]),   "OPP_FG_PCT_RANK": py(def_row["OPP_FG_PCT_RANK"]),
                "OPP_FG3_PCT": py(def_row["OPP_FG3_PCT"]), "OPP_FG3_PCT_RANK": py(def_row["OPP_FG3_PCT_RANK"]),
                "OPP_FG2_PCT": py(def_row["OPP_FG_PCT"]),  "OPP_FG2_PCT_RANK": py(def_row["OPP_FG_PCT_RANK"]),
            },
        })

    save_json(teams, "nba_team_stats.json")

# ============================================================
# 4. SCHEDULE (hoje + próximos N dias)
# ============================================================

def fetch_schedule():
    print(f"\n📅 A buscar schedule (próximos {SCHEDULE_DAYS_AHEAD} dias)...")

    all_games = []

    for i in range(SCHEDULE_DAYS_AHEAD):
        date = (datetime.today() + timedelta(days=i)).strftime("%m/%d/%Y")

        try:
            scoreboard = scoreboardv2.ScoreboardV2(
                game_date=date,
                league_id="00",
                day_offset=0,
            )
            games = scoreboard.get_normalized_dict()["GameHeader"]

            for game in games:
                all_games.append({
                    "date": game["GAME_DATE_EST"],
                    "visitor_team_id": game["VISITOR_TEAM_ID"],
                    "home_team_id": game["HOME_TEAM_ID"],
                    "status": game["GAME_STATUS_TEXT"],
                })

            print(f"  {date}: {len(games)} jogos")

        except Exception as e:
            print(f"  ⚠️ Erro em {date}: {e}")

        time.sleep(SLEEP_BETWEEN_REQUESTS)

    save_json(all_games, "nba_games_schedule.json")

# ============================================================
# 5. STANDINGS (temporada atual)
# ============================================================

def fetch_standings():
    print("\n🏆 A buscar standings...")
    import math

    cols = [
        "LeagueID", "SeasonID", "TeamID", "TeamName", "Conference",
        "ConferenceRecord", "PlayoffRank", "WINS", "LOSSES", "WinPCT",
        "LeagueRank", "Record", "HOME", "ROAD", "L10", "Last10Home", "Last10Road",
    ]

    df = leaguestandings.LeagueStandings(
        league_id="00",
        season=SEASON,
    ).get_data_frames()[0]

    result = df[cols].to_dict(orient="records")
    for row in result:
        for key, val in row.items():
            if isinstance(val, float) and math.isnan(val):
                row[key] = None
    save_json(result, "nba_standings.json")

# ============================================================
# 6. ROSTERS (temporada atual)
# ============================================================

def fetch_rosters():
    print("\n👥 A buscar rosters...")

    # busca os team IDs a partir dos standings
    df_teams = leaguestandings.LeagueStandings(
        league_id="00", season=SEASON
    ).get_data_frames()[0][["TeamID", "TeamName"]]

    rosters_list = []
    total = len(df_teams)

    for i, (_, row) in enumerate(df_teams.iterrows()):
        team_id = row["TeamID"]
        team_name = row["TeamName"]

        try:
            roster_df = commonteamroster.CommonTeamRoster(
                team_id=team_id, season=SEASON
            ).get_data_frames()[0]

            for _, p in roster_df[["PLAYER_ID", "PLAYER", "NUM", "POSITION", "HEIGHT", "WEIGHT", "BIRTH_DATE"]].iterrows():
                rosters_list.append({
                    "PLAYER_ID": int(p["PLAYER_ID"]),
                    "PLAYER": p["PLAYER"],
                    "NUM": p["NUM"],
                    "POSITION": p["POSITION"],
                    "HEIGHT": p["HEIGHT"],
                    "WEIGHT": p["WEIGHT"],
                    "BIRTH_DATE": p["BIRTH_DATE"],
                    "TEAM_NAME": team_name,
                    "TEAM_ID": int(team_id),
                    "TEAM_ABBREVIATION": TEAM_ABBREV_MAP.get(int(team_id), ""),
                })

            print(f"  [{i+1}/{total}] {team_name}: {len(roster_df)} jogadores")

        except Exception as e:
            print(f"  ⚠️ Erro em {team_name}: {e}")

        time.sleep(SLEEP_BETWEEN_REQUESTS)

    import math
    for player in rosters_list:
        for key, val in player.items():
            if isinstance(val, float) and math.isnan(val):
                player[key] = None
    save_json(rosters_list, "nba_rosters.json")

# ============================================================
# 7. INJURIES (ESPN API — pública, sem key)
# ============================================================

def fetch_injuries():
    print("\n🏥 A buscar injuries (ESPN)...")

    try:
        response = requests.get(ESPN_INJURIES_URL, timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"  ⚠️ Erro ao buscar injuries: {e}")
        return

    # adiciona TeamID a cada equipa e a cada lesão individual
    for team_entry in data.get("injuries", []):
        team_name = team_entry.get("displayName", "").strip()
        team_id = TEAM_NAME_TO_ID.get(team_name)

        if team_id is None:
            print(f"  ⚠️ TeamID não encontrado para: {team_name}")

        team_entry["TeamID"] = team_id

        for injury in team_entry.get("injuries", []):
            # mantém apenas os campos essenciais para reduzir o tamanho do ficheiro
            injury["TeamID"] = team_id

    # adiciona timestamp de atualização
    data["timestamp"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    save_json(data, "nba_injuries.json")

# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    start = datetime.now()
    print(f"🚀 A iniciar atualização de dados NBA — {start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Temporada: {SEASON}")
    print(f"   Output: {OUTPUT_DIR}")

    fetch_player_stats()
    fetch_team_stats()
    fetch_standings()
    fetch_rosters()
    fetch_schedule()
    fetch_injuries()
    fetch_player_game_logs()  # último porque é o mais lento

    elapsed = (datetime.now() - start).seconds
    print(f"\n✅ Concluído em {elapsed}s")