import { api } from "./http";

export type Client = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
};

export async function fetchClients(): Promise<Client[]> {
  const res = await api.get("/clients");
  return res.data;
}

export async function createClient(input: {
  name: string;
  address?: string;
  phone?: string;
}) {
  const res = await api.post("/clients", input);
  return res.data;
}
