import Link from "next/link";
import { format } from "date-fns";

import type { ShowtimeRow } from "@/features/showtimes/get-showtimes";

export const ShowtimesTable = ({ rows }: { rows: ShowtimeRow[] }) => (
  <div className="overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)]">
    <table className="min-w-full divide-y divide-[color:var(--border-subtle)] text-sm">
      <thead className="bg-[color:var(--panel-soft)] text-left text-xs uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
        <tr>
          <th className="px-4 py-3">Movie</th>
          <th className="px-4 py-3">Cinema</th>
          <th className="px-4 py-3">Start</th>
          <th className="px-4 py-3">Lang</th>
          <th className="px-4 py-3">Sub</th>
          <th className="px-4 py-3">Room</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[color:var(--border-subtle)] text-[color:var(--text-secondary)]">
        {rows.map((row) => (
          <tr key={row.showtime.id}>
            <td className="px-4 py-3">
              <Link href={`/movies/${row.movie.id}`} className="text-[color:var(--text-primary)] hover:text-[color:var(--accent-soft)]">
                {row.movie.title}
              </Link>
            </td>
            <td className="px-4 py-3">
              <Link href={`/cinemas/${row.cinema.id}`} className="hover:text-[color:var(--accent-soft)]">
                {row.cinema.name}
              </Link>
            </td>
            <td className="px-4 py-3">{format(row.showtime.startsAt, "EEE, dd MMM - HH:mm")}</td>
            <td className="px-4 py-3">{row.showtime.language}</td>
            <td className="px-4 py-3">{row.showtime.subtitleLanguage ?? "-"}</td>
            <td className="px-4 py-3">{row.showtime.room ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

