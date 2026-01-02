import { useEffect, useState } from "react";
import { api } from "../../api/http";

type Overview = {
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
};

export default function JobOverview({ jobId }: { jobId: string }) {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    api.get(`/jobs/${jobId}/overview`).then((res) => setData(res.data));
  }, [jobId]);

  if (!data) return <p className="text-gray-500">Loading overview…</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 border rounded">
        <p className="text-sm text-gray-500">Total Invoiced</p>
        <p className="text-xl font-bold">R {data.totalInvoiced}</p>
      </div>

      <div className="bg-white p-4 border rounded">
        <p className="text-sm text-gray-500">Total Paid</p>
        <p className="text-xl font-bold text-green-600">
          R {data.totalPaid}
        </p>
      </div>

      <div className="bg-white p-4 border rounded">
        <p className="text-sm text-gray-500">Outstanding</p>
        <p className="text-xl font-bold text-red-600">
          R {data.outstanding}
        </p>
      </div>
    </div>
  );
}
