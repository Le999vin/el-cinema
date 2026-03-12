import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { Card } from "@/components/ui/card";
import { getRecommendationsForUser } from "@/features/recommendations/get-recommendations";
import { requireUser } from "@/services/auth/auth-service";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const user = await requireUser();
  const recommendations = await getRecommendationsForUser(user.id, 5);

  const [topRecommendation, ...rest] = recommendations;

  return (
    <div className="space-y-6">
      <Card className="bg-[linear-gradient(120deg,_rgba(212,162,75,0.18),_rgba(18,16,17,0.96))]">
        <p className="text-sm uppercase tracking-[0.1em] text-[color:var(--accent-soft)]">Personal Recommendation Engine</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl">Your best cinema match tonight</h2>
        <p className="mt-3 max-w-3xl text-sm text-[color:var(--text-secondary)]">
          Rankings combine your genre preferences, multi-criteria ratings, favourite cinemas, watchlist intent, and your preferred time window.
        </p>
      </Card>

      {topRecommendation ? (
        <RecommendationCard recommendation={topRecommendation} highlight />
      ) : (
        <Card>
          <p className="text-sm text-[color:var(--text-muted)]">
            Not enough personalised signals yet. Add ratings or update preferences to unlock tailored picks.
          </p>
        </Card>
      )}

      {rest.length ? (
        <section className="space-y-4">
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Top Alternatives</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {rest.map((recommendation) => (
              <RecommendationCard key={recommendation.showtime.id} recommendation={recommendation} />
            ))}
          </div>
        </section>
      ) : null}

      <Card>
        <h3 className="font-[family-name:var(--font-display)] text-3xl">How Explanations Work</h3>
        <div className="mt-4 space-y-2 text-sm text-[color:var(--text-secondary)]">
          <p>• Why this movie: based on your strongest genre and criterion affinity.</p>
          <p>• Why this cinema: weighted by your favourite venues and previous selections.</p>
          <p>• Why this showtime: aligned with your preferred hours and near-term freshness score.</p>
        </div>
      </Card>
    </div>
  );
}

