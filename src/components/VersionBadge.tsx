import React from "react";
import { useAuth } from "./auth/AuthProvider";
import { getCurrentVersion } from "../services/versions";
import { supabase } from "../lib/supabase";
import { ExternalLink, Tag, AlertCircle } from "lucide-react";

interface VersionBadgeProps {
  className?: string;
}

const VersionBadge: React.FC<VersionBadgeProps> = ({ className }) => {
  const { user } = useAuth();
  const [version, setVersion] = React.useState<string>("0.0.0");
  const [error, setError] = React.useState<string | null>(null);
  const [isBeta, setIsBeta] = React.useState<boolean>(false);
  const [versionLink, setVersionLink] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadVersion = async () => {
      try {
        setError(null);
        const versionData = await getCurrentVersion();
        if (versionData) {
          setVersion(versionData.version);
          setIsBeta(versionData.is_beta || false);
          setVersionLink("https://github.com/cavort-konzepte-gmbh/pv-corr/blob/main/CHANGELOG.md");
        }
      } catch (err) {
        console.error("Error loading version:", err);
        setError("Failed to load version information");
        setVersion("0.0.0");
      }
    };
    
    loadVersion();
    
    // Set up interval to check for version updates every 5 minutes
    const interval = setInterval(loadVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  if (error) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1 print:hidden ${className}`}>
        <div className="bg-card border border-destructive rounded-md px-3 py-1 text-xs shadow-md">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={10} />
            <span>Version info unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1 print:hidden ${className}`}>
      <div className="bg-card border border-input rounded-md px-3 py-1 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">User:</span>
          <span className="font-medium">{user.email}</span>
        </div>
      </div>
      <div className="bg-card border border-input rounded-md px-3 py-1 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <Tag size={10} className="text-muted-foreground" />
          <a 
            href="https://github.com/cavort-konzepte-gmbh/pv-corr/blob/main/CHANGELOG.md" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium flex items-center gap-1 text-accent-primary hover:underline"
          >
            {version}
            <ExternalLink size={10} />
          </a>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {isBeta ? "Beta" : "Stable"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VersionBadge;