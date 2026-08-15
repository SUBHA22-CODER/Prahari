import React, { useState, useEffect } from 'react';
import DataSourceStatus from '../components/system/DataSourceStatus';
import { api } from '../services/api';

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSources() {
      setLoading(true);
      const data = await api.getDataSourceStatus();
      setDataSources(data);
      setLoading(false);
    }
    loadSources();
  }, []);

  if (loading) return <div className="h-64 bg-slate-200 animate-pulse rounded-md"></div>;

  return (
    <div className="space-y-4">
      <DataSourceStatus dataSources={dataSources} />
    </div>
  );
}
