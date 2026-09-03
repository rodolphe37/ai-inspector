import { Lock } from 'lucide-react';

export function PrivacyBadge({ label = 'Privacy-first' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <Lock className="h-3 w-3 text-primary" />
      {label}
    </span>
  );
}
