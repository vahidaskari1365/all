import { getCurrentOwner } from "@/lib/auth";
import { HeaderNav } from "@/components/header-nav";

export async function SiteHeader() {
  const owner = await getCurrentOwner();
  return <HeaderNav isAuthed={!!owner} ownerName={owner?.name} />;
}
