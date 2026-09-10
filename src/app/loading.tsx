import React from "react";
import PageLoader from "@/components/common/PageLoader";

export default function GlobalLoading() {
  return <PageLoader text="Mobility" subtext="Chargement de la page..." fullScreen />;
}
