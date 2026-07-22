"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getCampaigns()
      .then((data) => {
        if (!mounted) return;
        setCampaigns(data.campaigns || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || String(err));
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Campaigns</h1>
      {loading && <p className="mt-2 text-gray-600">Loading…</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-3">
          {campaigns.length === 0 && (
            <p className="text-gray-600">No campaigns yet. Create one to get started.</p>
          )}
          {campaigns.map((c) => (
            <div key={c.id} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.subject}</div>
                </div>
                <div className="text-sm text-gray-700">{c.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
