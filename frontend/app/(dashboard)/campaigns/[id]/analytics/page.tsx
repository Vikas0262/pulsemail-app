"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import CampaignAnalyticsPanel from "@/components/CampaignAnalyticsPanel";

type Campaign = {
  id: number;
  name: string;
  subject: string;
  status: string;
  recipients: { id: number; email: string; status: string }[];
};

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const campaignId = Number(params.id);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCampaign = useCallback(async () => {
    const data = await api.getCampaign(campaignId);
    setCampaign(data.campaign);
  }, [campaignId]);

  useEffect(() => {
    loadCampaign()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    const interval = setInterval(loadCampaign, 4000);
    return () => clearInterval(interval);
  }, [loadCampaign]);

  if (loading) return <div className="page-title">Loading performance…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!campaign) return <div className="alert alert-error">Campaign not found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/campaigns" className="text-sm" style={{ color: "var(--primary)" }}>
            ← All campaigns
          </Link>
          <h1 className="page-title mt-2">Performance</h1>
          <p className="page-subtitle">{campaign.name} · {campaign.subject}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${campaignId}`} className="btn btn-secondary">
            Campaign setup
          </Link>
          <span className={`badge badge-${campaign.status}`}>{campaign.status}</span>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <CampaignAnalyticsPanel campaignId={campaignId} poll />
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Recipient breakdown</h3>
        {campaign.recipients.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>No recipients on this campaign yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {campaign.recipients.map((r) => (
                  <tr key={r.id}>
                    <td>{r.email}</td>
                    <td>
                      <span className={`badge badge-${statusClass(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "opened") return "sent";
  if (status === "delivered") return "sent";
  if (status === "failed") return "failed";
  if (status === "scheduled" || status === "sending") return "sending";
  return "draft";
}
