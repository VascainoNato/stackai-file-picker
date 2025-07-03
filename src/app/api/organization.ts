const STACKAI_API_URL = process.env.NEXT_PUBLIC_STACKAI_API_URL!;

export async function getCurrentOrganization(token: string) {
  const res = await fetch(`${STACKAI_API_URL}/organizations/me/current`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to get organization");
  const data = await res.json();
  return data.org_id;
}