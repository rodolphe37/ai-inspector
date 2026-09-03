import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'right' | 'bottom';
}

export function Drawer({ open, onClose, title, children, side = 'right' }: DrawerProps) {
  const isRight = side === 'right';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={isRight ? { x: '100%' } : { y: '100%' }}
            animate={isRight ? { x: 0 } : { y: 0 }}
            exit={isRight ? { x: '100%' } : { y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className={`fixed z-50 surface border-l border-default ${
              isRight
                ? 'right-0 top-0 h-full w-full max-w-md'
                : 'left-0 bottom-0 w-full max-h-[80vh] rounded-b-none'
            }`}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-default">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-content transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100% - 70px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
