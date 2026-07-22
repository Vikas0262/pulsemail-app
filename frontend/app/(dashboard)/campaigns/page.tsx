"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Campaign = {
  id: number;
  name: string;
  subject: string;
  status: string;
  scheduledAt?: string | null;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getCampaigns()
      .then((data) => setCampaigns(data.campaigns || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Create, schedule, and track email campaigns</p>
        </div>
        <Link href="/campaigns/new" className="btn btn-primary">
          New campaign
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : campaigns.length === 0 ? (
        <div className="card empty-state">
          <p className="mb-4">No campaigns yet.</p>
          <Link href="/campaigns/new" className="btn btn-primary">Create your first campaign</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/campaigns/${c.id}`} className="card p-5 block hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold text-lg">{c.name}</div>
                  <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>{c.subject}</div>
                  {c.scheduledAt && (
                    <div className="text-xs mt-2" style={{ color: "var(--warning)" }}>
                      Scheduled for {new Date(c.scheduledAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
