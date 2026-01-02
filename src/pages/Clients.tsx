import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClients, createClient, type Client } from "../api/clients";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  async function loadClients() {
    const data = await fetchClients();
    setClients(data);
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createClient({ name, address, phone });
    setName("");
    setAddress("");
    setPhone("");
    loadClients();
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clients</h1>

      {/* Add client form */}
      <form
        onSubmit={handleAddClient}
        className="mb-6 grid grid-cols-3 gap-4 max-w-3xl"
      >
        <input
          className="border p-2"
          placeholder="Client name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 col-span-3 w-fit rounded">
          Add Client
        </button>
      </form>

      {/* Clients table */}
      <table className="w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border">{c.address ?? "-"}</td>
              <td className="p-2 border">{c.phone ?? "-"}</td>
              <td className="p-2 border">
                <Link
                  to={`/jobs?clientId=${c.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Jobs
                </Link>
              </td>
            </tr>
          ))}

          {clients.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="p-4 text-center text-gray-500"
              >
                No clients yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
