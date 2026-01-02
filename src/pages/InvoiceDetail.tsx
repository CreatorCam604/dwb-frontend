import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchInvoice,
  updateInvoiceLineItems,
  addInvoicePayment,
  type InvoiceLineItem,
} from "../api/invoices";

type Payment = {
  amount: number;
  payment_date: string;
  note?: string;
};

export default function InvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [loading, setLoading] = useState(true);

  // ---------------- LOAD INVOICE ----------------
  useEffect(() => {
    if (!invoiceId) return;

    const load = async () => {
      try {
        const invoice = await fetchInvoice(invoiceId);
        setItems(invoice.line_items ?? []);
        setPayments(invoice.payments ?? []);
        setJobId(invoice.job_id);
      } catch (err) {
        console.error("Failed to load invoice", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [invoiceId]);

  // ---------------- LINE ITEMS ----------------
  function updateItem(
    index: number,
    field: keyof InvoiceLineItem,
    value: any
  ) {
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

  // ---------------- PAYMENTS ----------------
  async function addPayment() {
    if (!invoiceId || !paymentAmount) return;

    await addInvoicePayment(invoiceId, {
      amount: Number(paymentAmount),
      note: paymentNote || undefined,
    });

    const invoice = await fetchInvoice(invoiceId);
    setPayments(invoice.payments ?? []);

    setPaymentAmount("");
    setPaymentNote("");
  }

  // ---------------- SAVE ----------------
  async function save() {
    if (!invoiceId || !jobId) return;

    await updateInvoiceLineItems(invoiceId, items);

    navigate(`/jobs/${jobId}`, {
      state: { tab: "invoices" },
    });
  }

  // ---------------- TOTALS ----------------
  const total = items.reduce(
    (sum, i) => sum + i.qty * i.unit_price,
    0
  );

  const paid = payments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const outstanding = total - paid;

  // ---------------- RENDER ----------------
  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Invoice</h1>

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
                R {(item.qty * item.unit_price).toFixed(2)}
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

      <button
        className="bg-gray-200 px-3 py-1"
        onClick={addItem}
      >
        + Add Line
      </button>

      {/* ---------- PAYMENTS ---------- */}
      <div className="border rounded p-4 space-y-3 bg-white">
        <h2 className="font-semibold text-lg">Payments</h2>

        {payments.length === 0 && (
          <p className="text-gray-500">No payments logged</p>
        )}

        {payments.map((p, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{new Date(p.payment_date).toLocaleDateString()}</span>
            <span>R {p.amount.toFixed(2)}</span>
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
            onClick={addPayment}
            className="bg-green-600 text-white px-4"
          >
            Add
          </button>
        </div>
      </div>

      {/* ---------- TOTALS ---------- */}
      <div className="text-right space-y-1">
        <div>Total: R {total.toFixed(2)}</div>
        <div>Paid: R {paid.toFixed(2)}</div>
        <div className="font-bold">
          Outstanding: R {outstanding.toFixed(2)}
        </div>
      </div>

      {/* ---------- SAVE ---------- */}
      <button
        className="bg-blue-600 text-white px-4 py-2"
        onClick={save}
      >
        Save Invoice
      </button>
    </div>
  );
}
