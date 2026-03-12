import { Card } from "@/components/ui/card";
import { requireUser } from "@/services/auth/auth-service";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-[family-name:var(--font-display)] text-5xl">Profile</h2>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Account identity and role information.</p>
      </Card>

      <Card className="space-y-2 text-sm text-[color:var(--text-secondary)]">
        <p>
          <span className="text-[color:var(--text-muted)]">Display name:</span> {user.displayName}
        </p>
        <p>
          <span className="text-[color:var(--text-muted)]">Email:</span> {user.email}
        </p>
        <p>
          <span className="text-[color:var(--text-muted)]">Role:</span> {user.role}
        </p>
      </Card>
    </div>
  );
}

