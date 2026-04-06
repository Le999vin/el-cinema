"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { List, Map } from "lucide-react";

import { CinemaCard } from "@/components/cinemas/cinema-card";
import { Button } from "@/components/ui/button";
import type { Cinema, CinemaSummary } from "@/domain/types";

const CinemaMap = dynamic(() => import("@/components/map/cinema-map").then((mod) => mod.CinemaMap), {
  ssr: false,
});

interface CinemaGridWithMapProps {
  summaries: CinemaSummary[];
  mapCinemas: Cinema[];
}

export const CinemaGridWithMap = ({ summaries, mapCinemas }: CinemaGridWithMapProps) => {
  const [mapMode, setMapMode] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={() => setMapMode((current) => !current)} className="gap-2">
          {mapMode ? <><List size={16} /> Show list</> : <><Map size={16} /> Show map</>}
        </Button>
      </div>

      {mapMode ? (
        <CinemaMap cinemas={mapCinemas} height={520} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{summaries.map((cinema) => <CinemaCard key={cinema.id} cinema={cinema} />)}</div>
      )}
    </div>
  );
};

