import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PrivacyBadge({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <Lock className="h-3 w-3 text-primary" />
      {label ?? t('common.privacyFirst')}
    </span>
  );
}
