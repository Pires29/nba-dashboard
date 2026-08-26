from datetime import datetime, timedelta

from update_data import (
    PLAYER_STATS_PARAMS,
    ROSTER_SEASON,
    SEASON,
    TEAM_ABBREV_MAP,
    nba_proxy_mapping,
    nba_result_set_dataframe,
    nba_stats_get_json,
)


TEAM_STATS_PARAMS = {
    "Conference": "",
    "DateFrom": "",
    "DateTo": "",
    "Division": "",
    "GameScope": "",
    "GameSegment": "",
    "LastNGames": "0",
    "LeagueID": "00",
    "Location": "",
    "MeasureType": "Base",
    "Month": "0",
    "OpponentTeamID": "0",
    "Outcome": "",
    "PORound": "0",
    "PaceAdjust": "N",
    "PerMode": "PerGame",
    "Period": "0",
    "PlayerExperience": "",
    "PlayerPosition": "",
    "PlusMinus": "N",
    "Rank": "Y",
    "Season": SEASON,
    "SeasonSegment": "",
    "SeasonType": "Regular Season",
    "ShotClockRange": "",
    "StarterBench": "",
    "TeamID": "0",
    "TwoWay": "0",
    "VsConference": "",
    "VsDivision": "",
}

GAME_LOG_PARAMS = {
    "Counter": "0",
    "DateFrom": "",
    "DateTo": "",
    "Direction": "ASC",
    "LeagueID": "00",
    "PlayerOrTeam": "P",
    "Season": SEASON,
    "SeasonType": "Regular Season",
    "Sorter": "DATE",
}

STANDINGS_PARAMS = {
    "LeagueID": "00",
    "Season": SEASON,
    "SeasonType": "Regular Season",
}

ROSTER_PARAMS = {
    "LeagueID": "00",
    "Season": ROSTER_SEASON,
    "TeamID": str(next(iter(TEAM_ABBREV_MAP))),
}


def count_first_result_set(endpoint, params):
    payload = nba_stats_get_json(endpoint, params)
    df = nba_result_set_dataframe(payload)
    print(f"✅ {endpoint}: {len(df)} rows")


def smoke_all():
    today = datetime.now().strftime("%m/%d/%Y")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%m/%d/%Y")
    tests = [
        ("leaguedashplayerstats", {**PLAYER_STATS_PARAMS, "Season": SEASON}),
        ("leaguedashteamstats", TEAM_STATS_PARAMS),
        ("leaguegamelog", GAME_LOG_PARAMS),
        ("leaguestandings", STANDINGS_PARAMS),
        ("commonteamroster", ROSTER_PARAMS),
        ("scoreboardv2", {"DayOffset": "0", "GameDate": today, "LeagueID": "00"}),
        ("scoreboardv2", {"DayOffset": "0", "GameDate": tomorrow, "LeagueID": "00"}),
    ]

    for endpoint, params in tests:
        count_first_result_set(endpoint, params)


def main():
    print(
        f"curl_cffi smoke test: proxy {'enabled' if nba_proxy_mapping() else 'disabled'}"
    )
    smoke_all()


if __name__ == "__main__":
    main()
