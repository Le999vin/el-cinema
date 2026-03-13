"use client";

import dynamic from "next/dynamic";

import type { Cinema } from "@/domain/types";

const DynamicCinemaMap = dynamic(() => import("@/components/map/cinema-map").then((mod) => mod.CinemaMap), {
  ssr: false,
});

export const CinemaMapShell = ({ cinemas, height }: { cinemas: Cinema[]; height?: number }) => {
  return <DynamicCinemaMap cinemas={cinemas} height={height} />;
};
