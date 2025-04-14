import React from "react";
import { ExternalLink, AlertCircle } from "lucide-react";

interface VersionBadgeProps {
  className?: string;
}

const VersionBadge: React.FC<VersionBadgeProps> = ({ className }) => {
  const [error, setError] = React.useState<string | null>(null);

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

  // Return null since we've moved the version info to the breadcrumb navigation
  return null;
};

export default VersionBadge;
