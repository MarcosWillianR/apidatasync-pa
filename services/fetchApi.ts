import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth-options';

export async function AuthGetApi(url: string) {
  const session = await getServerSession(authOptions);

  let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session?.user.token}`,
    },
  });

  const data = await res.json()
  return data;
}