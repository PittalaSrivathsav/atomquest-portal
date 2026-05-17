import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Account and application preferences."
      />
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <p className="font-medium">Session</p>
          <p className="text-muted-foreground text-sm">
            Sign out of ATOMQUEST on this device.
          </p>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
