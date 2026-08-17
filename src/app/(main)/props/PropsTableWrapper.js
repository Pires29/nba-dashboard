"use client";
import AppToaster from "@/components/AppToaster";
import PropsTable from "@/components/props/PropsTable";

export default function PropsTableWrapper({
  basePath,
  enrichedProps,
  allTeams,
  standings,
  schedule,
  injuries,
  totalPropsCount,
  isFreePlan,
  dataStatus,
  initialFilters,
}) {
  return (
    <>
      <PropsTable
        key={JSON.stringify(initialFilters)}
        basePath={basePath}
        enrichedProps={enrichedProps}
        allTeams={allTeams}
        standings={standings}
        schedule={schedule}
        injuries={injuries}
        totalPropsCount={totalPropsCount}
        isFreePlan={isFreePlan}
        dataStatus={dataStatus}
        initialFilters={initialFilters}
      />
      <AppToaster />
    </>
  );
}
