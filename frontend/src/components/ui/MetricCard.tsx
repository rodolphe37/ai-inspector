import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
}

export function MetricCard({ icon, label, value, trend, color = 'text-primary' }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="surface p-5"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg bg-surface-2 ${color}`}>{icon}</div>
        {trend && <span className="text-xs text-subtle">{trend}</span>}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="text-sm text-muted mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}
