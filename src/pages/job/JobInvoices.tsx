import { useEffect, useState } from "react";
import {
  fetchInvoices,
  createInvoice,
  deleteInvoice,
  type Invoice,
} from "../../api/invoices";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/http";

export default function JobInvoices({ jobId }: { jobId: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const navigate = useNavigate();

  async function loadInvoices() {
    const data = await fetchInvoices(jobId);
    setInvoices(data);
  }

  async function handleCreateInvoice() {
    const invoice = await createInvoice(jobId);
    navigate(`/invoices/${invoice.id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    await deleteInvoice(id);
    loadInvoices();
  }

  async function handleDownload(id: string, number: number) {
    const res = await api.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${number}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (jobId) loadInvoices();
  }, [jobId]);

  return (
    <div>
      <button
        onClick={handleCreateInvoice}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Invoice
      </button>

      <table className="w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Invoice #</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Actions</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="p-2 border">{inv.invoice_number}</td>
              <td className="p-2 border">
                {new Date(inv.created_at).toLocaleDateString()}
              </td>
              <td className="p-2 border">
                R {(Number(inv.total) || 0).toFixed(2)}
              </td>
              <td className="p-2 border">
                <Link
                  to={`/invoices/${inv.id}`}
                  className="text-blue-600 hover:underline mr-3"
                >
                  Edit
                </Link>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleDownload(inv.id, inv.invoice_number)}
                >
                  PDF
                </button>
              </td>
              <td className="p-2 border text-center">
                <button
                  className="text-red-600"
                  onClick={() => handleDelete(inv.id)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}

          {invoices.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No invoices yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
