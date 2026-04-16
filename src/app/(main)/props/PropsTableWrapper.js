"use client";
import PropsTable from "@/components/props/PropsTable";

export default function PropsTableWrapper({
  basePath,
  enrichedProps,
  allTeams,
  standings,
  schedule,
  injuries,
  totalPropsCount,
  initialFilters,
}) {
  return (
    <PropsTable
      basePath={basePath}
      enrichedProps={enrichedProps}
      allTeams={allTeams}
      standings={standings}
      schedule={schedule}
      injuries={injuries}
      totalPropsCount={totalPropsCount}
      initialFilters={initialFilters}
    />
  );
}
