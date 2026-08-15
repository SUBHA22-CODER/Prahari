import React, { useState, useEffect } from 'react';
import SystemHealth from '../components/system/SystemHealth';
import { api } from '../services/api';

export default function SystemStatusPage() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      setLoading(true);
      const data = await api.getSystemStatus();
      setStatusData(data);
      setLoading(false);
    }
    loadStatus();
  }, []);

  if (loading) return <div className="h-64 bg-slate-200 animate-pulse rounded-md"></div>;

  return (
    <div className="space-y-4">
      <SystemHealth statusData={statusData} />
    </div>
  );
}
