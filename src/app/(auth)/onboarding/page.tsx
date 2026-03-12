import { OnboardingForm } from "@/components/auth/onboarding-form";
import { loadCinemasCatalog } from "@/features/catalog/load-catalog";
import { requireUser } from "@/services/auth/auth-service";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  await requireUser();
  const cinemas = await loadCinemasCatalog();

  return <OnboardingForm cinemaOptions={cinemas.map((cinema) => ({ id: cinema.id, name: cinema.name }))} />;
}

