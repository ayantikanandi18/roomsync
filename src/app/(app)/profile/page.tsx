import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Your preferences</h1>
      <p className="text-sm text-muted mb-6">
        This is what the compatibility score is calculated from — the more accurate, the better your matches.
      </p>
      <ProfileForm profile={user.profile} />
    </div>
  );
}
