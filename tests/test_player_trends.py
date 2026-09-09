import unittest
from scripts.player_trends import build_player_trends


class PlayerTrendsTests(unittest.TestCase):
    def test_numeric_averages_use_latest_ten_including_playoffs(self):
        games = [{"date": f"2026-01-{day:02}", "min": day, "pf": day / 2}
                 for day in range(1, 12)]
        result = build_player_trends(list(reversed(games)), [])
        for key, factor in [("minutes", 1), ("fouls", 0.5)]:
            with self.subTest(stat=key):
                self.assertEqual(result["stats"][key]["last10"], 6.5 * factor)
                self.assertEqual(result["stats"][key]["season"], 6 * factor)
                self.assertEqual(result["stats"][key]["difference"], 0.5 * factor)
        self.assertFalse(result["includesPlayoffs"])

    def test_all_shooting_percentages_use_paired_totals(self):
        for key, made, attempted in [("fg_pct", "fgm", "fga"),
                                     ("fg3_pct", "fg3m", "fg3a"),
                                     ("ft_pct", "ftm", "fta")]:
            with self.subTest(stat=key):
                games = [{"date": "2026-01-01", made: 1, attempted: 1}]
                games += [{"date": "2026-02-01", made: 1, attempted: 4}] * 10
                stat = build_player_trends(games, [])["stats"][key]
                self.assertEqual(stat["last10"], 0.25)
                self.assertAlmostEqual(stat["season"], 11 / 41)
                self.assertAlmostEqual(stat["difference"], (0.25 - 11 / 41) * 100)

    def test_invalid_and_incomplete_measurements_are_excluded(self):
        games = [{"min": value} for value in [None, True, "30", float("nan"), float("inf")]]
        games += [{"fgm": 2}, {"fga": 4}, {"fgm": -1, "fga": 2},
                  {"fgm": 3, "fga": 2}, {"fgm": 1, "fga": 4, "min": 20}]
        result = build_player_trends(games, [])
        self.assertEqual(result["stats"]["minutes"]["last10"], 20)
        self.assertEqual(result["stats"]["minutes"]["sampleGames"], 1)
        self.assertEqual(result["stats"]["fg_pct"]["last10"], 0.25)
        self.assertEqual(result["stats"]["fg_pct"]["sampleGames"], 1)

    def test_weighted_percentages_and_percentage_point_delta(self):
        games = [{"date": f"2026-01-{day:02}", "min": 30, "pf": 2,
                  "fgm": 1, "fga": 2} for day in range(1, 11)]
        result = build_player_trends(games, [{"date": "2026-04-01", "min": 40, "pf": 0, "fgm": 9, "fga": 10}])
        fg = result['stats']['fg_pct']
        self.assertAlmostEqual(fg['last10'], 18 / 28)
        self.assertAlmostEqual(fg['season'], 19 / 30)
        self.assertAlmostEqual(fg['difference'], (18 / 28 - 19 / 30) * 100)
        self.assertEqual(result['stats']['minutes']['last10'], 31)
        self.assertEqual(result['recentGames'], 10)
        self.assertEqual(result['seasonGames'], 11)
        self.assertTrue(result['includesPlayoffs'])

    def test_missing_values_and_zero_attempts(self):
        result = build_player_trends([{"date": "2026-01-01", "min": 0, "pf": 0,
                                      "ftm": 0, "fta": 0}, {"min": None}], [])
        self.assertIsNone(result['stats']['ft_pct']['last10'])
        self.assertIsNone(result['stats']['ft_pct']['difference'])
        self.assertEqual(result['stats']['minutes']['last10'], 0)
        self.assertEqual(result['stats']['minutes']['sampleGames'], 1)
        self.assertEqual(result['recentGames'], 2)
        self.assertEqual(result['stats']['minutes']['difference'], 0)

    def test_empty(self):
        result = build_player_trends([], [])
        self.assertEqual(result['recentGames'], 0)
        self.assertIsNone(result['stats']['minutes']['season'])


if __name__ == '__main__':
    unittest.main()
