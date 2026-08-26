"use client";
import PropsTable from "@/components/props/PropsTable";

export default function PropsTableWrapper({
  basePath,
  enrichedProps,
  standings,
  schedule,
  injuries,
  totalPropsCount,
  isFreePlan,
  dataStatus,
  initialFilters,
}) {
  return (
    <PropsTable
      key={JSON.stringify(initialFilters)}
      basePath={basePath}
      enrichedProps={enrichedProps}
      standings={standings}
      schedule={schedule}
      injuries={injuries}
      totalPropsCount={totalPropsCount}
      isFreePlan={isFreePlan}
      dataStatus={dataStatus}
      initialFilters={initialFilters}
    />
  );
}
