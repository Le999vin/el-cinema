import { getCinemas } from "@/features/cinemas/get-cinemas";
import { getMovies } from "@/features/movies/get-movies";
import { jsonOk } from "@/lib/http";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return jsonOk({ cinemas: [], movies: [] });
  }

  const [cinemas, movies] = await Promise.all([
    getCinemas({ search: query, sort: "name" }),
    getMovies({ search: query, sort: "title" }),
  ]);

  return jsonOk({
    cinemas: cinemas.slice(0, 6),
    movies: movies.slice(0, 6),
  });
}

