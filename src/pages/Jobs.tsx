import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchJobs, createJob, updateJobStatus, type Job } from "../api/jobs";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [params] = useSearchParams();
  const clientId = params.get("clientId");

  async function loadJobs() {
    if (!clientId) return;
    const data = await fetchJobs(clientId);
    setJobs(data);
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !title) return;

    await createJob({
      clientId,
      title,
      description: description.trim() ? description : undefined,
    });

    setTitle("");
    setDescription("");
    await loadJobs(); // ✅ refresh list after create
  }

  async function handleToggleStatus(job: Job) {
    const nextStatus = job.status === "OPEN" ? "COMPLETED" : "OPEN";
    await updateJobStatus(job.id, nextStatus);
    await loadJobs();
  }

  useEffect(() => {
    if (clientId) loadJobs();
  }, [clientId]);

  if (!clientId) {
    return <p className="text-gray-600">Select a client to view jobs.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>

      {/* Add job */}
      <form onSubmit={handleAddJob} className="mb-6 max-w-xl space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Job title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Job
        </button>
      </form>

      {/* Jobs list */}
      <table className="w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="p-2 border">{job.title}</td>

              {/* ✅ Status toggle button */}
              <td className="p-2 border">
                <button
                  onClick={() => handleToggleStatus(job)}
                  className={`px-3 py-1 rounded text-white ${
                    job.status === "OPEN" ? "bg-green-600" : "bg-gray-500"
                  }`}
                >
                  {job.status}
                </button>
              </td>

              <td className="p-2 border">
                <Link
                  to={`/jobs/${job.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}

          {jobs.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                No jobs yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
