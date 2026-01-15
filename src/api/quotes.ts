import { api } from "./http";

/* =======================
   TYPES
======================= */

export type Quote = {
  id: string;
  quote_number: number;
  created_at: string;
};

export type QuoteLineItem = {
  description: string;
  qty: number;
  unit_price: number;
};

/* =======================
   QUOTES
======================= */

export async function fetchQuotes(jobId: string): Promise<Quote[]> {
  const res = await api.get("/quotes", {
    params: { jobId },
  });
  return res.data;
}

export async function createQuote(jobId: string) {
  const res = await api.post("/quotes", {
    job_id: jobId,
    quote_date: new Date().toISOString().slice(0, 10),
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

export async function fetchQuote(id: string) {
  const res = await api.get(`/quotes/${id}`);
  return res.data as {
    id: string;
    job_id: string;
    line_items: QuoteLineItem[];
  };
}

export async function updateQuoteLineItems(quoteId: string, items: QuoteLineItem[]) {
  await api.put(`/quotes/${quoteId}`, {
    line_items: items,
  });
}

export async function convertQuoteToInvoice(quoteId: string) {
  const res = await api.post(`/quotes/${quoteId}/convert`);
  return res.data; // returns invoice
}

export function downloadQuotePdf(quoteId: string) {
  return api.get(`/quotes/${quoteId}/pdf`, {
    responseType: "blob",
  });
}
