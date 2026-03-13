"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import type { Cinema } from "@/domain/types";
import { SWITZERLAND_CENTER, SWITZERLAND_DEFAULT_ZOOM } from "@/lib/swiss-discovery-areas";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const CinemaMap = ({ cinemas, height = 360 }: { cinemas: Cinema[]; height?: number }) => {
  const plottedCinemas = useMemo(
    () => cinemas.filter((cinema) => Number.isFinite(cinema.lat) && Number.isFinite(cinema.lng) && (cinema.lat !== 0 || cinema.lng !== 0)),
    [cinemas],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border-subtle)]" style={{ height }}>
      <MapContainer center={SWITZERLAND_CENTER} zoom={SWITZERLAND_DEFAULT_ZOOM} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitCinemaBounds cinemas={plottedCinemas} />

        {plottedCinemas.map((cinema) => (
          <Marker key={cinema.id} position={[cinema.lat, cinema.lng]} icon={markerIcon}>
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

const FitCinemaBounds = ({ cinemas }: { cinemas: Cinema[] }) => {
  const map = useMap();

  useEffect(() => {
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
  }, [cinemas, map]);

  return null;
};
