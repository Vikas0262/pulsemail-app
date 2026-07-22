"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getAudiences()
      .then((data) => {
        if (!mounted) return;
        setAudiences(data.audiences || []);
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
      <h1 className="text-3xl font-bold">Audiences</h1>
      {loading && <p className="mt-2 text-gray-600">Loading…</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-3">
          {audiences.length === 0 && (
            <p className="text-gray-600">No audiences yet. Create one to get started.</p>
          )}
          {audiences.map((a) => (
            <div key={a.id} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-sm text-gray-500">Created: {new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-700">Members: {a.memberCount ?? 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
