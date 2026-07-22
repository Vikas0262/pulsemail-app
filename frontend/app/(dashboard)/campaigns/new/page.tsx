"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { validateRequired } from "@/lib/validation";

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nameError = validateRequired(name, "Campaign name");
    const subjectError = validateRequired(subject, "Subject");
    const bodyError = validateRequired(body, "Email body");
    if (nameError || subjectError || bodyError) {
      setError(nameError || subjectError || bodyError || "Invalid input");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await api.createCampaign({ name: name.trim(), subject: subject.trim(), body: body.trim() });
      router.push(`/campaigns/${data.campaign.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New campaign</h1>
          <p className="page-subtitle">Draft your email, then choose recipients on the next step</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-3xl">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Campaign name</label>
          <input className="input mt-1" placeholder="Spring newsletter" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Subject</label>
          <input className="input mt-1" placeholder="Your subject line" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Body (HTML supported)</label>
          <textarea
            className="input mt-1 min-h-[200px] font-mono text-sm"
            placeholder="<p>Hello {{name}}</p>"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating…" : "Continue to recipients"}
        </button>
      </form>
    </div>
  );
}
