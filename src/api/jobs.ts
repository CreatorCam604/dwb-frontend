import { api } from "./http";

export type Job = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  start_date: string;
  status: "OPEN" | "COMPLETED";
  created_at: string;
};

export type JobDetail = Job & {
  client_name: string;
};

export async function fetchJobs(clientId: string): Promise<Job[]> {
  const res = await api.get("/jobs", { params: { clientId } });
  return res.data;
}

export async function createJob(input: {
  clientId: string;
  title: string;
  description?: string;
}) {
  const res = await api.post("/jobs", {
    client_id: input.clientId,
    title: input.title,
    description: input.description,
    start_date: new Date().toISOString().slice(0, 10), // ISO date (YYYY-MM-DD)
  });

  return res.data;
}

export async function updateJobStatus(
  jobId: string,
  status: "OPEN" | "COMPLETED"
) {
  const res = await api.put(`/jobs/${jobId}/status`, { status });
  return res.data;
}

export async function fetchJobDetail(jobId: string): Promise<JobDetail> {
  const res = await api.get(`/jobs/${jobId}`);
  return res.data;
}

/** Optional helper if you want to use it instead of calling api.get directly in the component */
export type JobOverview = {
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
};

export async function fetchJobOverview(jobId: string): Promise<JobOverview> {
  const res = await api.get(`/jobs/${jobId}/overview`);
  return res.data;
}
