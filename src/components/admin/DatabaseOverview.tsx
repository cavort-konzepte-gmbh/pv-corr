import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { supabase } from "../../lib/supabase";
import { BarChart2, Users, Database, HardDrive } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig } from "../ui/chart";

interface DatabaseOverviewProps {
  currentTheme: Theme;
}

interface Statistics {
  database: {
    rest_requests: number;
  };
  auth: {
    total_users: number;
    total_signups: number;
  };
  storage: {
    total_storage: number;
    total_egress: number;
  };
}

const DatabaseOverview: React.FC<DatabaseOverviewProps> = ({ currentTheme }) => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data: dbStats, error: dbError } = await supabase.rpc("get_database_statistics");

        if (dbError) throw dbError;

        setStats(dbStats);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load database statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>;
  }
  const data = [
    { name: "REST Requests", value: stats?.database.rest_requests || 0 },
    { name: "Total Users", value: stats?.auth.total_users || 0 },
    { name: "New Signups", value: stats?.auth.total_signups || 0 },
    { name: "Total Storage", value: stats?.storage.total_storage || 0 },
    { name: "Egress", value: stats?.storage.total_egress || 0 },
  ];
  const chartConfig = {
    value: { label: "value", color: "hsl(var(--chart-1))" },
    "Total Users": { label: "Total Users", color: "hsl(var(--chart-2))" },
    "New Signups": { label: "New Signups", color: "hsl(var(--chart-3))" },
    "Total Storage": { label: "Total Storage", color: "hsl(var(--chart-4))" },
    Egress: { label: "Egress", color: "#ef4444" },
  } satisfies ChartConfig;
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Stats */}
        <div className="p-6 rounded-lg border border-accent text-card-foreground">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <Database className="text-accent-primary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium">Database</h3>
              <p className="text-sm text-muted-foreground">REST Requests</p>
            </div>
          </div>
          <div className="text-3xl font-bold">{stats?.database.rest_requests.toLocaleString() || "0"}</div>
        </div>

        {/* Auth Stats */}
        <div className="p-6 rounded-lg border border-accent text-card-foreground">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <Users className="text-accent-primary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium">Auth</h3>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
          <div className="text-3xl font-bold">{stats?.auth.total_users.toLocaleString() || "0"}</div>
          <div className="mt-2 text-sm text-muted-foreground">{stats?.auth.total_signups.toLocaleString() || "0"} new signups</div>
        </div>

        {/* Storage Stats */}
        <div className="p-6 rounded-lg border border-accent text-card-foreground">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <HardDrive className="text-accent-primary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium">Storage</h3>
              <p className="text-sm text-muted-foreground">Total Storage</p>
            </div>
          </div>
          <div className="text-3xl font-bold">{formatBytes(stats?.storage.total_storage || 0)}</div>
          <div className="mt-2 text-sm text-muted-foreground">{formatBytes(stats?.storage.total_egress || 0)} egress</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-4 mb-6">
          <BarChart2 className="text-accent-primary" size={24} />
          <h3 className="text-lg font-medium">Usage Trends</h3>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium">Database Statistics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart width={500} height={300} data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default DatabaseOverview;
