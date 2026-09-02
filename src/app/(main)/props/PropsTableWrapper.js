"use client";
import PropsTable from "@/components/props/PropsTable";

export default function PropsTableWrapper({
  basePath,
  standings,
  schedule,
  propsCount,
  isFreePlan,
  dataStatus,
  initialFilters,
  children,
}) {
  return (
    <PropsTable
      key={JSON.stringify(initialFilters)}
      basePath={basePath}
      standings={standings}
      schedule={schedule}
      propsCount={propsCount}
      isFreePlan={isFreePlan}
      dataStatus={dataStatus}
      initialFilters={initialFilters}
    >
      {children}
    </PropsTable>
  );
}
