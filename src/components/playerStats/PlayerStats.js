import ResponsiveLayout from "./layout/ResponsiveLayout";

const PlayerStats = ({
  data,
  plan,
  stat,
  isPlayerLocked = false,
  lockedPlayerName,
}) => {
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <ResponsiveLayout
        player={data.player}
        playerStats={data.playerStats}
        contextGames={data.contextGames}
        hasCurrentGames={data.hasCurrentGames}
        hasPreviousGames={data.hasPreviousGames}
        hasPlayoffGames={data.hasPlayoffGames}
        injuryMap={data.injuryStatusMap}
        plan={plan}
        currentGame={data.currentGame}
        gamesSchedule={data.gamesSchedule}
        teamNameMap={data.teamNameMap}
        homeRoster={data.homeRoster}
        awayRoster={data.awayRoster}
        team1Formatted={data.team1Formatted}
        team2Formatted={data.team2Formatted}
        injuriesTeam1={data.injuriesTeam1}
        injuriesTeam2={data.injuriesTeam2}
        initialSelectedName={data.initialSelectedName}
        initialActiveTeam={data.initialActiveTeam}
        opponentAbbr={data.opponentAbbr}
        statGraphData={data.statGraphData}
        initialStat={stat}
        isPlayerLocked={isPlayerLocked}
        lockedPlayerName={lockedPlayerName}
      />
    </div>
  );
};

export default PlayerStats;
