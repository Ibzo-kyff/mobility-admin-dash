import React from "react";
import PageLoader from "@/components/common/PageLoader";

export default function DashboardLoading() {
  return (
    <PageLoader
      text="Tableau de bord"
      subtext="Préparation de vos données..."
      fullScreen={false}
    />
  );
}
