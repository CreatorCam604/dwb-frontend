import { api } from "./http";

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data.token as string;
}
