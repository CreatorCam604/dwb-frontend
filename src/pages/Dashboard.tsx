import { useEffect, useState } from "react";
import { api } from "../api/http";

type DashboardSummary = {
  outstandingBalance: number;
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

      <div className="bg-white border rounded p-6 max-w-sm">
        <p className="text-sm text-gray-500">Outstanding Balance</p>
        <p className="text-3xl font-bold text-red-600">
          {summary ? `R ${summary.outstandingBalance}` : "Loading…"}
        </p>
      </div>
    </div>
  );
}

