import { cookies } from 'next/headers';

export async function getAuthToken() {
  const name = process.env.JWT_COOKIE_NAME ?? 'gb_token';
  const cookieStore = await cookies(); 
  return cookieStore.get(name)?.value ?? null;
}
