import { useEffect, useState } from "react";
import { api } from "../api/http";

type DashboardSummary = {
  outstandingBalance: number;
  quotedPipeline: number;
  quotesCount: number;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api.get("/dashboard/summary").then((res) => {
      setSummary(res.data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border rounded p-6">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-3xl font-bold text-red-600">
            {summary ? `R ${summary.outstandingBalance}` : "Loading…"}
          </p>
        </div>

        <div className="bg-white border rounded p-6">
          <p className="text-sm text-gray-500">Unconverted Quotes</p>
          <p className="text-3xl font-bold">
            {summary ? `R ${summary.quotedPipeline}` : "Loading…"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {summary ? `${summary.quotesCount} active quote(s)` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

