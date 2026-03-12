"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import type { Cinema } from "@/domain/types";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const CinemaMap = ({ cinemas, height = 360 }: { cinemas: Cinema[]; height?: number }) => {
  const center = useMemo<[number, number]>(() => {
    if (!cinemas.length) {
      return [47.3769, 8.5417];
    }

    const lat = cinemas.reduce((acc, cinema) => acc + cinema.lat, 0) / cinemas.length;
    const lng = cinemas.reduce((acc, cinema) => acc + cinema.lng, 0) / cinemas.length;

    return [lat, lng];
  }, [cinemas]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border-subtle)]" style={{ height }}>
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cinemas.map((cinema) => (
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

