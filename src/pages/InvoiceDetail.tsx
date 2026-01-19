import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  fetchInvoice,
  updateInvoiceLineItems,
  addInvoicePayment,
  deleteInvoicePayment,
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
  id: string;
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

    const load = async () => {
      setLoading(true);
      try {
        if (mode === "invoice") {
          const invoice = await fetchInvoice(invoiceId);

          setItems(
            invoice.line_items.map((i) => ({
              description: i.description,
              qty: Number(i.qty),
              unit_price: Number(i.unit_price),
            }))
          );

          setPayments(invoice.payments ?? []);
          setJobId(invoice.job_id);
        } else {
          const quote = await fetchQuote(invoiceId);

          setItems(
            quote.line_items.map((i) => ({
              description: i.description,
              qty: Number(i.qty),
              unit_price: Number(i.unit_price),
            }))
          );

          setPayments([]);
          setJobId(quote.job_id);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [invoiceId, mode]);

  /* ================= LINE ITEMS ================= */
  function updateItem(index: number, field: keyof LineItem, value: number | string) {
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
    return items.some(
      (i) => i.description.trim().length > 0 && Number(i.qty) > 0
    );
  }, [items]);

  /* ================= PAYMENTS ================= */
  async function addPaymentHandler() {
    if (!invoiceId || !paymentAmount) return;

    await addInvoicePayment(invoiceId, {
      amount: Number(paymentAmount),
      note: paymentNote || undefined,
    });

    const updated = await fetchInvoice(invoiceId);
    setPayments(updated.payments ?? []);

    setPaymentAmount("");
    setPaymentNote("");
  }

  async function deletePaymentHandler(paymentId: string) {
    if (!confirm("Delete this payment?")) return;

    await deleteInvoicePayment(paymentId);
    const updated = await fetchInvoice(invoiceId!);
    setPayments(updated.payments ?? []);
  }

  /* ================= SAVE ================= */
  async function save() {
    if (!invoiceId || !jobId || !hasAtLeastOneValidLine) return;

    setSaving(true);
    try {
      if (mode === "invoice") {
        await updateInvoiceLineItems(invoiceId, items);
      } else {
        await updateQuoteLineItems(invoiceId, items);
      }

      navigate(`/jobs/${jobId}`);
    } finally {
      setSaving(false);
    }
  }

  /* ================= CONVERT ================= */
  async function convert() {
    if (!invoiceId || !jobId) return;

    setConverting(true);
    try {
      await convertQuoteToInvoice(invoiceId);
      navigate(`/jobs/${jobId}`);
    } finally {
      setConverting(false);
    }
  }

  /* ================= TOTALS (FIXED) ================= */
  const total = items.reduce((sum, i) => {
    const line = Number(i.qty) * Number(i.unit_price);
    return Number((sum + line).toFixed(2));
  }, 0);

  const paid = payments.reduce((sum, p) => {
    return Number((sum + Number(p.amount)).toFixed(2));
  }, 0);

  const outstanding = Number((total - paid).toFixed(2));

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">
        {mode === "quote" ? "Quote" : "Invoice"}
      </h1>

      {/* LINE ITEMS */}
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
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                />
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  className="w-full border p-1"
                  value={item.qty}
                  onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                />
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  className="w-full border p-1"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(i, "unit_price", Number(e.target.value))
                  }
                />
              </td>
              <td className="p-2 border">R {(item.qty * item.unit_price).toFixed(2)}</td>
              <td className="p-2 border text-center">
                <button className="text-red-600" onClick={() => removeItem(i)}>
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

      {/* PAYMENTS */}
      {mode === "invoice" && (
        <div className="border rounded p-4 bg-white space-y-3">
          <h2 className="font-semibold text-lg">Payments</h2>

          {payments.map((p) => (
            <div key={p.id} className="flex justify-between items-center text-sm">
              <span>{new Date(p.payment_date).toLocaleDateString()}</span>
              <span>R {Number(p.amount).toFixed(2)}</span>
              <span className="text-gray-500 flex-1 ml-2">{p.note}</span>
              <button
                className="text-red-600 ml-2"
                onClick={() => deletePaymentHandler(p.id)}
              >
                ✕
              </button>
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
              placeholder="Note"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
            />
            <button onClick={addPaymentHandler} className="bg-green-600 text-white px-4">
              Add
            </button>
          </div>
        </div>
      )}

      {/* TOTALS */}
      <div className="text-right space-y-1">
        <div>Total: R {total.toFixed(2)}</div>
        {mode === "invoice" && <div>Paid: R {paid.toFixed(2)}</div>}
        <div className="font-bold">
          {mode === "invoice"
            ? `Outstanding: R ${outstanding.toFixed(2)}`
            : `Quote Total: R ${total.toFixed(2)}`}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          className="bg-blue-600 text-white px-4 py-2"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>

        {mode === "quote" && (
          <button
            className="bg-green-600 text-white px-4 py-2"
            onClick={convert}
            disabled={converting}
          >
            Convert to Invoice
          </button>
        )}
      </div>
    </div>
  );
}
