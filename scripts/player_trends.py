"""Precomputed Player Trends, shared by all consumers of a player snapshot."""
import math


def build_player_trends(current, playoffs):
    """Aggregate the current season (including playoffs), newest ten games first.

    Missing measurements are excluded, never replaced with zero. Percentages
    remain fractions; only their differences use percentage points.
    """
    games = sorted([*current, *playoffs], key=lambda game: game.get("date") or "", reverse=True)
    recent = games[:10]

    def number(game, key):
        value = game.get(key)
        return value if type(value) in (int, float) and math.isfinite(value) else None

    def average(sample, key):
        values = [number(game, key) for game in sample]
        values = [value for value in values if value is not None]
        return (sum(values) / len(values) if values else None), len(values)

    def percentage(sample, made, attempted):
        pairs = [(number(game, made), number(game, attempted)) for game in sample]
        pairs = [(m, a) for m, a in pairs if m is not None and a is not None and 0 <= m <= a]
        attempts = sum(a for _, a in pairs)
        return (sum(m for m, _ in pairs) / attempts if attempts else None), len(pairs)

    stats = {}
    for key, fields in {
        "minutes": ("min",), "fouls": ("pf",),
        "fg_pct": ("fgm", "fga"), "fg3_pct": ("fg3m", "fg3a"),
        "ft_pct": ("ftm", "fta"),
    }.items():
        aggregate = average if len(fields) == 1 else percentage
        last10, count = aggregate(recent, *fields)
        season, _ = aggregate(games, *fields)
        # Percentage deltas are stored in percentage points for display.
        difference = ((last10 - season) * (100 if len(fields) == 2 else 1)
                      if last10 is not None and season is not None else None)
        stats[key] = {"last10": last10, "season": season, "difference": difference, "sampleGames": count}

    return {"recentGames": len(recent), "seasonGames": len(games),
            "includesPlayoffs": bool(playoffs), "stats": stats}
