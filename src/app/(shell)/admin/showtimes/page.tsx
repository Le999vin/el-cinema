import { AdminShowtimesManager } from "@/components/admin/admin-showtimes-manager";
import { Card } from "@/components/ui/card";
import { loadCinemasCatalog, loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";
import { requireAdmin } from "@/services/auth/auth-service";

export const dynamic = "force-dynamic";

export default async function AdminShowtimesPage() {
  await requireAdmin();

  const [showtimes, movies, cinemas] = await Promise.all([
    loadShowtimesCatalog(),
    loadMoviesCatalog(),
    loadCinemasCatalog(),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-[family-name:var(--font-display)] text-5xl">Showtime Admin</h2>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Manage app-owned showtime records for MVP operations.</p>
      </Card>

      <AdminShowtimesManager
        showtimes={showtimes}
        movies={movies.map((movie) => ({ id: movie.id, title: movie.title }))}
        cinemas={cinemas.map((cinema) => ({ id: cinema.id, name: cinema.name }))}
      />
    </div>
  );
}

