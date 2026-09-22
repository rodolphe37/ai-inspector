import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Info, MinusCircle } from 'lucide-react';
import type { DetectionStatus } from '@/types/analysis';
import { motion } from 'framer-motion';

const config: Record<
  DetectionStatus,
  { color: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
  clean: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: CheckCircle2 },
  found: { color: 'text-info', bg: 'bg-info/10', border: 'border-info/20', icon: Info },
  not_found: { color: 'text-subtle', bg: 'bg-surface-2', border: 'border-default', icon: MinusCircle },
  possible: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', icon: AlertTriangle },
  inconclusive: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', icon: HelpCircle },
  failed: { color: 'text-error', bg: 'bg-error/10', border: 'border-error/20', icon: XCircle },
};

interface StatusBadgeProps {
  status: DetectionStatus;
  label?: string;
  size?: 'sm' | 'md';
  animate?: boolean;
}

export function StatusBadge({ status, label, size = 'sm', animate = true }: StatusBadgeProps) {
  const { t } = useTranslation();
  const c = config[status];
  const Icon = c.icon;
  const padding = size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const content = (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border ${c.bg} ${c.border} ${c.color} ${padding} ${textSize} font-medium`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {label ?? t(`status.detection.${status}`)}
    </span>
  );

  if (animate) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.span>
    );
  }
  return content;
}

export function StatusDot({ status }: { status: DetectionStatus }) {
  const c = config[status];
  return <span className={`inline-block h-2 w-2 rounded-full ${c.color.replace('text-', 'bg-')}`} />;
}

export type { ReactNode };
