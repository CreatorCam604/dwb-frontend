import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JobOverview from "./job/JobOverview";
import JobInvoices from "./job/JobInvoices";
import JobQuotes from "./job/JobQuotes";
import { fetchJobDetail, type JobDetail } from "../api/jobs";

export default function JobDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState<"overview" | "invoices" | "quotes">("overview");
  const [job, setJob] = useState<JobDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchJobDetail(id).then(setJob).catch(() => setJob(null));
  }, [id]);

  if (!id) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {job ? `${job.client_name} – ${job.title}` : "Job"}
      </h1>

      {/* Tabs */}
      <div className="mb-6 border-b flex gap-4">
        {["overview", "invoices", "quotes"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 ${
              tab === t
                ? "border-b-2 border-blue-600 font-medium"
                : "text-gray-500"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && <JobOverview jobId={id} />}
      {tab === "invoices" && <JobInvoices jobId={id} />}
      {tab === "quotes" && <JobQuotes jobId={id} />}
    </div>
  );
}
