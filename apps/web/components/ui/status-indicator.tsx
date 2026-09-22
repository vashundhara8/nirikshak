import * as React from "react";
import { OfficialApplicationStatus, OfficialDocumentStatus } from "@/types/scholarship";
import { StatusBadge } from "@/components/ui/status-badge";

interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OfficialApplicationStatus | OfficialDocumentStatus | string;
  showDot?: boolean;
}

export function StatusIndicator({
  status,
  className,
  ...props
}: StatusIndicatorProps) {
  return <StatusBadge status={status} className={className} {...props} />;
}
