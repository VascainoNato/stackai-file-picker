const SUPABASE_AUTH_URL = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function login(email: string, password: string) {
  const res = await fetch(`${SUPABASE_AUTH_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      gotrue_meta_security: {},
    }),
  });
  
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }
  
  const data = await res.json();
  return data.access_token; 
}