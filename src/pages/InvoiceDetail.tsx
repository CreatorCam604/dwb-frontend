import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  fetchInvoice,
  updateInvoiceLineItems,
  addInvoicePayment,
} from "../api/invoices";

import {
  fetchQuote,
  updateQuoteLineItems,
  convertQuoteToInvoice,
} from "../api/quotes";

type LineItem = {
  description: string;
  qty: number;
  unit_price: number;
};

type Payment = {
  amount: number;
  payment_date: string;
  note?: string;
};

type Props = {
  mode: "invoice" | "quote";
};

export default function InvoiceDetail({ mode }: Props) {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<LineItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!invoiceId) return;

    setLoading(true);

    const load = async () => {
      try {
        if (mode === "invoice") {
          const invoice = await fetchInvoice(invoiceId);

          setItems(
            (invoice.line_items ?? []).map((i) => ({
              description: i.description ?? "",
              qty: Number(i.qty),
              unit_price: Number(i.unit_price),
            }))
          );

          setPayments(invoice.payments ?? []);
          setJobId(invoice.job_id);
        } else {
          const quote = await fetchQuote(invoiceId);

          setItems(
            (quote.line_items ?? []).map((i) => ({
              description: i.description ?? "",
              qty: Number(i.qty),
              unit_price: Number(i.unit_price),
            }))
          );

          setPayments([]); // quotes never have payments
          setJobId(quote.job_id);
        }
      } catch (err) {
        console.error("Failed to load document", err);
        alert("Failed to load. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [invoiceId, mode]);

  /* ================= LINE ITEMS ================= */
  function updateItem(index: number, field: keyof LineItem, value: any) {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  }

  function addItem() {
    setItems([...items, { description: "", qty: 1, unit_price: 0 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  /* ================= VALIDATION ================= */
  const hasAtLeastOneValidLine = useMemo(() => {
    if (!items || items.length === 0) return false;

    return items.some(
      (i) => i.description.trim().length > 0 && Number(i.qty) > 0
    );
  }, [items]);

  /* ================= PAYMENTS (INVOICE ONLY) ================= */
  async function addPaymentHandler() {
    if (mode !== "invoice") return;
    if (!invoiceId || !paymentAmount) return;

    try {
      await addInvoicePayment(invoiceId, {
        amount: Number(paymentAmount),
        note: paymentNote || undefined,
      });

      const updated = await fetchInvoice(invoiceId);
      setPayments(updated.payments ?? []);

      setPaymentAmount("");
      setPaymentNote("");
    } catch (err) {
      console.error("Failed to add payment", err);
      alert("Failed to add payment. Please try again.");
    }
  }

  /* ================= SAVE ================= */
  async function save() {
    if (!invoiceId || !jobId) return;

    if (!hasAtLeastOneValidLine) {
      alert("Please add at least one line item with a description and qty.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "invoice") {
        await updateInvoiceLineItems(invoiceId, items);
      } else {
        await updateQuoteLineItems(invoiceId, items);
      }

      navigate(`/jobs/${jobId}`, {
        state: { tab: mode === "quote" ? "quotes" : "invoices" },
      });
    } catch (err) {
      console.error("Failed to save", err);
      alert("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ================= CONVERT ================= */
  async function convert() {
    if (mode !== "quote" || !invoiceId || !jobId) return;

    if (!hasAtLeastOneValidLine) {
      alert("Please add at least one line item before converting.");
      return;
    }

    setConverting(true);
    try {
      await convertQuoteToInvoice(invoiceId);

      navigate(`/jobs/${jobId}`, {
        state: { tab: "invoices" },
      });
    } catch (err) {
      console.error("Failed to convert quote", err);
      alert("Convert failed. Please try again.");
    } finally {
      setConverting(false);
    }
  }

  /* ================= TOTALS ================= */
  const total = items.reduce(
    (sum, i) => sum + Number(i.qty) * Number(i.unit_price),
    0
  );

  const paid = payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const outstanding = total - paid;

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">
        {mode === "quote" ? "Quote" : "Invoice"}
      </h1>

      {/* ---------- LINE ITEMS ---------- */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Description</th>
            <th className="p-2 border w-20">Qty</th>
            <th className="p-2 border w-32">Unit Price</th>
            <th className="p-2 border w-32">Total</th>
            <th className="p-2 border w-12"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="p-2 border">
                <input
                  className="w-full border p-1"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(i, "description", e.target.value)
                  }
                />
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  className="w-full border p-1"
                  value={item.qty}
                  min={1}
                  onChange={(e) =>
                    updateItem(i, "qty", Number(e.target.value))
                  }
                />
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  className="w-full border p-1"
                  value={item.unit_price}
                  min={0}
                  onChange={(e) =>
                    updateItem(i, "unit_price", Number(e.target.value))
                  }
                />
              </td>
              <td className="p-2 border">
                R {(Number(item.qty) * Number(item.unit_price)).toFixed(2)}
              </td>
              <td className="p-2 border text-center">
                <button
                  className="text-red-600"
                  onClick={() => removeItem(i)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="bg-gray-200 px-3 py-1" onClick={addItem}>
        + Add Line
      </button>

      {/* ---------- PAYMENTS ---------- */}
      {mode === "invoice" && (
        <div className="border rounded p-4 space-y-3 bg-white">
          <h2 className="font-semibold text-lg">Payments</h2>

          {payments.length === 0 && (
            <p className="text-gray-500">No payments logged</p>
          )}

          {payments.map((p, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {new Date(p.payment_date).toLocaleDateString()}
              </span>
              <span>R {Number(p.amount).toFixed(2)}</span>
              <span className="text-gray-500">{p.note}</span>
            </div>
          ))}

          <div className="flex gap-2 mt-3">
            <input
              type="number"
              className="border p-2 w-32"
              placeholder="Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <input
              className="border p-2 flex-1"
              placeholder="Note (optional)"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
            />
            <button
              onClick={addPaymentHandler}
              className="bg-green-600 text-white px-4"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* ---------- TOTALS ---------- */}
      <div className="text-right space-y-1">
        <div>Total: R {total.toFixed(2)}</div>

        {mode === "invoice" && (
          <div>Paid: R {paid.toFixed(2)}</div>
        )}

        <div className="font-bold">
          {mode === "invoice"
            ? `Outstanding: R ${outstanding.toFixed(2)}`
            : `Quote Total: R ${total.toFixed(2)}`}
        </div>
      </div>

      {/* ---------- ACTIONS ---------- */}
      <div className="flex gap-3">
        <button
          className="bg-blue-600 text-white px-4 py-2 disabled:opacity-60"
          onClick={save}
          disabled={saving}
        >
          {saving
            ? "Saving…"
            : `Save ${mode === "quote" ? "Quote" : "Invoice"}`}
        </button>

        {mode === "quote" && (
          <button
            className="bg-green-600 text-white px-4 py-2 disabled:opacity-60"
            onClick={convert}
            disabled={converting}
          >
            {converting ? "Converting…" : "Convert to Invoice"}
          </button>
        )}
      </div>
    </div>
  );
}
