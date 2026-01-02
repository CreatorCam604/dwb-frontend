import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JobOverview from "./job/JobOverview";
import JobInvoices from "./job/JobInvoices";
import { fetchJobDetail, type JobDetail } from "../api/jobs";

export default function JobDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState<"overview" | "invoices">("overview");
  const [job, setJob] = useState<JobDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchJobDetail(id).then(setJob).catch(() => setJob(null));
  }, [id]);

  if (!id) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
            {job
            ? `${job.client_name} – ${job.title}`
            : "Job"}
        </h1>

      {/* Tabs */}
      <div className="mb-6 border-b flex gap-4">
        <button
          onClick={() => setTab("overview")}
          className={`px-4 py-2 ${
            tab === "overview"
              ? "border-b-2 border-blue-600 font-medium"
              : "text-gray-500"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setTab("invoices")}
          className={`px-4 py-2 ${
            tab === "invoices"
              ? "border-b-2 border-blue-600 font-medium"
              : "text-gray-500"
          }`}
        >
          Invoices
        </button>
      </div>

      {tab === "overview" && <JobOverview jobId={id} />}
      {tab === "invoices" && <JobInvoices jobId={id} />}
    </div>
  );
}
