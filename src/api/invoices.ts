import { api } from "./http";

/* =======================
   TYPES
======================= */

export type Invoice = {
  id: string;
  invoice_number: number;
  total: number;
  created_at: string;
};

export type InvoiceLineItem = {
  description: string;
  qty: number;
  unit_price: number;
};

export type InvoicePayment = {
  amount: number;
  payment_date: string;
  note?: string;
};

/* =======================
   INVOICES
======================= */

export async function fetchInvoices(jobId: string): Promise<Invoice[]> {
  const res = await api.get("/invoices", {
    params: { jobId },
  });
  return res.data;
}

export async function createInvoice(jobId: string) {
  const res = await api.post("/invoices", {
    job_id: jobId,
    invoice_date: new Date().toISOString().slice(0, 10),
    terms: "COD",
    line_items: [
      {
        description: "Labour",
        qty: 1,
        unit_price: 0,
      },
    ],
  });

  return res.data;
}

export function downloadInvoicePdf(invoiceId: string) {
  return api.get(`/invoices/${invoiceId}/pdf`, {
    responseType: "blob",
  });
}

export async function fetchInvoice(id: string) {
  const res = await api.get(`/invoices/${id}`);
  return res.data as {
    id: string;
    job_id: string;
    line_items: InvoiceLineItem[];
    payments?: InvoicePayment[];
  };
}

export async function updateInvoiceLineItems(
  invoiceId: string,
  items: InvoiceLineItem[]
) {
  await api.put(`/invoices/${invoiceId}`, {
    line_items: items,
  });
}

/* =======================
   PAYMENTS (NEW)
======================= */

export async function addInvoicePayment(
  invoiceId: string,
  input: {
    amount: number;
    note?: string;
  }
) {
  await api.post(`/invoices/${invoiceId}/payments`, input);
}
