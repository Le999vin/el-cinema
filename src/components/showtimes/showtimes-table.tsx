import { format } from "date-fns";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { ShowtimeRow } from "@/features/showtimes/get-showtimes";

export const ShowtimesTable = ({ rows }: { rows: ShowtimeRow[] }) => {
  if (!rows.length) {
    return (
      <Card>
        <p className="text-sm text-[color:var(--text-muted)]">
          No showtimes match the current filters. Reset the filters to see the full weekly program.
        </p>
        <Link href="/showtimes" className="mt-3 inline-flex text-sm text-[color:var(--accent-soft)]">
          Reset filters
        </Link>
      </Card>
    );
  }

  const groupedRows = rows.reduce<Record<string, ShowtimeRow[]>>((acc, row) => {
    const key = format(row.showtime.startsAt, "EEEE, dd MMMM");
    const current = acc[key] ?? [];

    return {
      ...acc,
      [key]: [...current, row],
    };
  }, {});

  return (
    <>
      <div className="space-y-4 md:hidden">
        {Object.entries(groupedRows).map(([day, items]) => (
          <div key={day} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">{day}</p>
            <div className="space-y-3">
              {items.map((row) => (
                <Card key={row.showtime.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/movies/${row.movie.id}`} className="text-lg text-[color:var(--text-primary)]">
                        {row.movie.title}
                      </Link>
                      <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{row.cinema.name}</p>
                    </div>
                    <p className="text-sm font-medium text-[color:var(--accent-soft)]">
                      {format(row.showtime.startsAt, "HH:mm")}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-[color:var(--text-muted)]">
                    <p>Language: {row.showtime.language}</p>
                    <p>Subtitles: {row.showtime.subtitleLanguage ?? "None listed"}</p>
                    <p>Room: {row.showtime.room ?? "TBA"}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/cinemas/${row.cinema.id}`} className="text-sm text-[color:var(--accent-soft)]">
                      View cinema
                    </Link>
                    <Link href={`/movies/${row.movie.id}`} className="text-sm text-[color:var(--accent-soft)]">
                      View movie
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)] md:block">
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
    </>
  );
};
