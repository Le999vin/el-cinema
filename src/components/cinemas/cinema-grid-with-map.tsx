"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CinemaCard } from "@/components/cinemas/cinema-card";
import { Button } from "@/components/ui/button";
import type { Cinema, CinemaSummary } from "@/domain/types";

const CinemaMap = dynamic(() => import("@/components/map/cinema-map").then((mod) => mod.CinemaMap), {
  ssr: false,
});

interface CinemaGridWithMapProps {
  summaries: CinemaSummary[];
  mapCinemas: Cinema[];
  initialView: "list" | "map";
}

export const CinemaGridWithMap = ({ summaries, mapCinemas, initialView }: CinemaGridWithMapProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"list" | "map">(initialView);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(summaries[0]?.id ?? null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedMapCinemaId = useMemo(() => {
    if (selectedCinemaId && mapCinemas.some((cinema) => cinema.id === selectedCinemaId)) {
      return selectedCinemaId;
    }

    return mapCinemas[0]?.id ?? null;
  }, [mapCinemas, selectedCinemaId]);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (!selectedCinemaId || !summaries.some((cinema) => cinema.id === selectedCinemaId)) {
      setSelectedCinemaId(summaries[0]?.id ?? null);
    }
  }, [selectedCinemaId, summaries]);

  useEffect(() => {
    if (view !== "list" || !selectedCinemaId) {
      return;
    }

    cardRefs.current[selectedCinemaId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedCinemaId, view]);

  const updateView = (nextView: "list" | "map") => {
    setView(nextView);

    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!summaries.length) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--text-muted)]">No venues match the current filters.</p>
          <div className="flex items-center gap-2">
            <Button variant={view === "list" ? "primary" : "secondary"} onClick={() => updateView("list")}>
              List
            </Button>
            <Button variant={view === "map" ? "primary" : "secondary"} onClick={() => updateView("map")}>
              Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--text-muted)]">
          {summaries.length} venues match your current filters.
        </p>
        <div className="flex items-center gap-2">
          <Button variant={view === "list" ? "primary" : "secondary"} onClick={() => updateView("list")}>
            List
          </Button>
          <Button variant={view === "map" ? "primary" : "secondary"} onClick={() => updateView("map")}>
            Map
          </Button>
        </div>
      </div>

      {view === "map" ? (
        <CinemaMap
          cinemas={mapCinemas}
          height={520}
          selectedCinemaId={selectedMapCinemaId}
          onSelectCinema={(cinemaId) => setSelectedCinemaId(cinemaId)}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {summaries.map((cinema) => (
            <div
              key={cinema.id}
              ref={(element) => {
                cardRefs.current[cinema.id] = element;
              }}
              onMouseEnter={() => setSelectedCinemaId(cinema.id)}
              onFocusCapture={() => setSelectedCinemaId(cinema.id)}
            >
              <CinemaCard
                cinema={cinema}
                selected={selectedCinemaId === cinema.id}
                onSelect={() => {
                  setSelectedCinemaId(cinema.id);
                  updateView("map");
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
