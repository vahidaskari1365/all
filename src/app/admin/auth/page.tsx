import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import AuthAdmin from "../auth-admin";

export const dynamic = "force-dynamic";

export default async function AuthAdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin");
  return (
    <div className="min-h-screen bg-canvas">
      <AuthAdmin
        adminName={admin.name}
        adminEmail={admin.email}
        totpEnabled={admin.totpEnabled}
      />
    </div>
  );
}
