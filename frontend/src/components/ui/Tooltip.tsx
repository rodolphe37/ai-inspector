import { motion } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="relative group inline-flex">
      {children}
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-surface-2 border border-default text-xs text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
      >
        {content}
      </motion.span>
    </span>
  );
}
