import { PreferencesForm } from "@/components/settings/preferences-form";
import { Card } from "@/components/ui/card";
import { loadCinemasCatalog } from "@/features/catalog/load-catalog";
import { hasDatabase } from "@/lib/env";
import { requireUser } from "@/services/auth/auth-service";
import { getUserPreferences } from "@/services/db/repositories/user-repository";

export const dynamic = "force-dynamic";

const emptyPreferences = {
  favouriteGenres: [],
  preferredTimeStart: 18,
  preferredTimeEnd: 23,
  preferredCinemaIds: [],
};

export default async function SettingsPage() {
  const user = await requireUser();
  const [cinemas, preferences] = await Promise.all([
    loadCinemasCatalog(),
    hasDatabase ? getUserPreferences(user.id) : emptyPreferences,
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-[family-name:var(--font-display)] text-5xl">Settings</h2>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Fine tune recommendation and showtime behaviour.</p>
      </Card>

      <Card>
        <PreferencesForm
          initial={{
            favouriteGenres: preferences.favouriteGenres,
            preferredTimeStart: preferences.preferredTimeStart,
            preferredTimeEnd: preferences.preferredTimeEnd,
            preferredCinemaIds: preferences.preferredCinemaIds,
          }}
          cinemas={cinemas.map((cinema) => ({ id: cinema.id, name: cinema.name }))}
        />
      </Card>
    </div>
  );
}

