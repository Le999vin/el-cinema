"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import type { Cinema } from "@/domain/types";
import { SWITZERLAND_CENTER, SWITZERLAND_DEFAULT_ZOOM } from "@/lib/swiss-discovery-areas";

const createMarker = (accent: string, halo: string) =>
  L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
    html: `<span style="display:block;width:20px;height:20px;border-radius:999px;background:${accent};border:2px solid #0b0a0b;box-shadow:0 0 0 8px ${halo};"></span>`,
  });

const markerIcon = createMarker("#d4a24b", "rgba(212,162,75,0.18)");
const activeMarkerIcon = createMarker("#f4efe5", "rgba(230,188,117,0.34)");

export const CinemaMap = ({
  cinemas,
  height = 360,
  selectedCinemaId,
  onSelectCinema,
}: {
  cinemas: Cinema[];
  height?: number;
  selectedCinemaId?: string | null;
  onSelectCinema?: (cinemaId: string) => void;
}) => {
  const plottedCinemas = useMemo(
    () =>
      cinemas.filter(
        (cinema) =>
          Number.isFinite(cinema.lat) && Number.isFinite(cinema.lng) && (cinema.lat !== 0 || cinema.lng !== 0),
      ),
    [cinemas],
  );
  const markerRefs = useRef<Record<string, L.Marker>>({});

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border-subtle)]" style={{ height }}>
      <MapContainer center={SWITZERLAND_CENTER} zoom={SWITZERLAND_DEFAULT_ZOOM} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <SyncCinemaMap
          cinemas={plottedCinemas}
          selectedCinemaId={selectedCinemaId}
          markerRefs={markerRefs}
        />

        {plottedCinemas.map((cinema) => (
          <Marker
            key={cinema.id}
            ref={(marker) => {
              if (marker) {
                markerRefs.current[cinema.id] = marker;
                return;
              }

              delete markerRefs.current[cinema.id];
            }}
            position={[cinema.lat, cinema.lng]}
            icon={selectedCinemaId === cinema.id ? activeMarkerIcon : markerIcon}
            eventHandlers={{
              click: () => onSelectCinema?.(cinema.id),
            }}
          >
            <Popup>
              <div>
                <p className="font-semibold">{cinema.name}</p>
                <p className="text-xs">{cinema.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const SyncCinemaMap = ({
  cinemas,
  selectedCinemaId,
  markerRefs,
}: {
  cinemas: Cinema[];
  selectedCinemaId?: string | null;
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}) => {
  const map = useMap();

  useEffect(() => {
    const selectedCinema = cinemas.find((cinema) => cinema.id === selectedCinemaId);
    if (selectedCinema) {
      map.setView([selectedCinema.lat, selectedCinema.lng], 13);
      markerRefs.current[selectedCinema.id]?.openPopup();
      return;
    }

    if (!cinemas.length) {
      map.setView(SWITZERLAND_CENTER, SWITZERLAND_DEFAULT_ZOOM);
      return;
    }

    if (cinemas.length === 1) {
      map.setView([cinemas[0].lat, cinemas[0].lng], 14);
      return;
    }

    map.fitBounds(
      L.latLngBounds(cinemas.map((cinema) => [cinema.lat, cinema.lng] as [number, number])),
      { padding: [36, 36] },
    );
  }, [cinemas, map, markerRefs, selectedCinemaId]);

  return null;
};
