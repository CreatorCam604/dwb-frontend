import { useEffect, useState } from "react";
import { api } from "../../api/http";

type Overview = {
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;

  // ✅ new
  totalQuoted: number;
  quotesCount: number;
};

export default function JobOverview({ jobId }: { jobId: string }) {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    api.get(`/jobs/${jobId}/overview`).then((res) => setData(res.data));
  }, [jobId]);

  if (!data) return <p className="text-gray-500">Loading overview…</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white p-4 border rounded">
        <p className="text-sm text-gray-500">Total Invoiced</p>
        <p className="text-xl font-bold">R {data.totalInvoiced}</p>
      </div>

      <div className="bg-white p-4 border rounded">
        <p className="text-sm text-gray-500">Total Paid</p>
        <p className="text-xl font-bold text-green-600">R {data.totalPaid}</p>
      </div>

      <div className="bg-white p-4 border rounded">
        <p className="text-sm text-gray-500">Outstanding</p>
        <p className="text-xl font-bold text-red-600">R {data.outstanding}</p>
      </div>

      <div className="bg-white p-4 border rounded">
        <p className="text-sm text-gray-500">Total Quoted</p>
        <p className="text-xl font-bold">R {data.totalQuoted}</p>
      </div>

      <div className="bg-white p-4 border rounded">
        <p className="text-sm text-gray-500">Quotes</p>
        <p className="text-xl font-bold">{data.quotesCount}</p>
        <p className="text-xs text-gray-500 mt-1">Active</p>
      </div>
    </div>
  );
}
