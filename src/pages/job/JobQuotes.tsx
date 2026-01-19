import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchQuotes,
  createQuote,
  downloadQuotePdf,
  deleteQuote,
  type Quote,
} from "../../api/quotes";

export default function JobQuotes({ jobId }: { jobId: string }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= LOAD ================= */
  async function load() {
    setLoading(true);
    try {
      const data = await fetchQuotes(jobId);
      setQuotes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (jobId) load();
  }, [jobId]);

  /* ================= CREATE ================= */
  async function onCreate() {
    const quote = await createQuote(jobId);
    navigate(`/quotes/${quote.id}`);
  }

  /* ================= PDF ================= */
  async function onPdf(
    e: React.MouseEvent,
    id: string,
    number: number
  ) {
    e.stopPropagation(); // 🔑 CRITICAL FIX

    try {
      const res = await downloadQuotePdf(id);
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quote-${number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("PDF not available yet");
    }
  }

  /* ================= DELETE ================= */
  async function onDeleteQuote(
    e: React.MouseEvent,
    quoteId: string
  ) {
    e.stopPropagation(); // prevent row navigation

    if (!confirm("Delete this quote?")) return;

    try {
      await deleteQuote(quoteId);
      await load(); // refresh list
    } catch (err) {
      console.error("Failed to delete quote", err);
      alert("Failed to delete quote");
    }
  }

  /* ================= UI ================= */
  if (loading) return <div className="text-gray-500">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Quotes</h2>

        <button
          onClick={onCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + New Quote
        </button>
      </div>

      {quotes.length === 0 && (
        <p className="text-gray-500">No quotes yet</p>
      )}

      {quotes.length > 0 && (
        <table className="w-full border bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Quote #</th>
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr
                key={q.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/quotes/${q.id}`)}
              >
                <td className="p-2 border">{q.quote_number}</td>
                <td className="p-2 border">
                  {new Date(q.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={(e) =>
                        onPdf(e, q.id, q.quote_number)
                      }
                    >
                      PDF
                    </button>

                    <button
                      className="text-red-600"
                      onClick={(e) =>
                        onDeleteQuote(e, q.id)
                      }
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
