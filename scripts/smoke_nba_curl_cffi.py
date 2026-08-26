import os

from curl_cffi import requests


NBA_STATS_URL = "https://stats.nba.com/stats/leaguedashplayerstats"

NBA_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.nba.com",
    "Referer": "https://www.nba.com/",
    "x-nba-stats-origin": "stats",
    "x-nba-stats-token": "true",
}

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
    "Season": os.getenv("NBA_STATS_SEASON", "2025-26"),
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


def main():
    proxy = os.getenv("NBA_PROXY_URL", "").strip()
    proxies = {"http": proxy, "https": proxy} if proxy else None
    print(f"curl_cffi smoke test: proxy {'enabled' if proxy else 'disabled'}")

    response = requests.get(
        NBA_STATS_URL,
        params=PLAYER_STATS_PARAMS,
        headers=NBA_HEADERS,
        impersonate="chrome",
        proxies=proxies,
        timeout=120,
    )
    print(f"HTTP {response.status_code}")
    response.raise_for_status()

    payload = response.json()
    result_sets = payload.get("resultSets") or payload.get("resultSet") or []
    first_set = result_sets[0] if isinstance(result_sets, list) and result_sets else {}
    rows = first_set.get("rowSet", [])
    print(f"curl_cffi NBA smoke test passed: {len(rows)} player rows")


if __name__ == "__main__":
    main()
