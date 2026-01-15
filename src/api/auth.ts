import { api } from "./http";

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  const { token } = res.data;

  if (token) {
    localStorage.setItem("token", token);
  }

  return res.data;
}
