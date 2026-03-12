"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Pagination,
} from "@mui/material";
import { sortStats } from "@/lib/sortStats";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CustomTable = ({ playerInfo }) => {
  const [selectedStat, setSelectedStat] = useState("points");
  const [order, setOrder] = useState("DESC");

  const sortedPlayers = useMemo(() => {
    return sortStats({
      playerInfoV2: [...playerInfo],
      stat: selectedStat,
      order,
    });
  }, [playerInfo, selectedStat, order]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    return sortedPlayers.slice(start, end);
  }, [sortedPlayers, currentPage]);

  const handleSort = (stat) => {
    setSelectedStat(stat);
    setOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
  };

  const options = [
    { key: "Name", value: "name" },
    { key: "PPG", value: "points" },
    { key: "APG", value: "assists" },
    { key: "RPG", value: "rebounds" },
    { key: "BPG", value: "blocks" },
    { key: "TO", value: "turnovers" },
    { key: "STL", value: "steals" },
  ];

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {options.map((option, index) => (
              <TableCell
                key={index}
                onClick={() => {
                  handleSort(option.value);
                }}
                align="center"
              >
                {option.key}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedPlayers.map((player, i) => {
            return (
              <TableRow
                key={player.playerName}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Link
                    href={`/player?name=${player.playerName}`}
                    underline="hover"
                  >
                    {player.playerName}
                  </Link>
                </TableCell>
                {options.slice(1).map((opt) => (
                  <TableCell key={opt.key} align="right">
                    {player.stats[opt.value]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <CustomPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={Math.ceil(sortedPlayers.length / itemsPerPage)}
      />
    </TableContainer>
  );
};

const CustomPagination = ({ currentPage, setCurrentPage, totalPages }) => {
  return (
    <Stack spacing={2}>
      <Pagination
        page={currentPage}
        onChange={(event, value) => {
          setCurrentPage(value);
        }}
        count={totalPages}
        color="primary"
      />
    </Stack>
  );
};

export default CustomTable;
