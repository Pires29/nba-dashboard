"use client";

//Hooks
import getRosters from "@/lib/getRosters";

//Styles
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { getServerSession } from "next-auth";

//React
import { useState } from "react";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Rosters() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const rostersData = getRosters();

  const [selectedTeam, setSelectedTeam] = useState("");

  const playersByTeam = rostersData.reduce((acc, player) => {
    if (!acc[player.TEAM_NAME]) {
      acc[player.TEAM_NAME] = [];
    }
    acc[player.TEAM_NAME].push(player);
    return acc;
  }, {});

  const handleChange = (event) => {
    setSelectedTeam(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Team</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedTeam || ""}
          label="Team"
          onChange={handleChange}
        >
          {Object.entries(playersByTeam).map(([team, players]) => {
            return (
              <MenuItem key={team} value={team}>
                {team}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {selectedTeam && (
        <div>
          <p>{selectedTeam}</p>
          {playersByTeam[selectedTeam].map((player) => (
            <div key={player.PLAYER_ID} className="flex gap-2">
              <p>{player.NUM}</p>
              <p>{player.PLAYER}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
