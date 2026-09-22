import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-6">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight tabular-nums">404</h1>
        <p className="mt-4 text-lg text-muted">
          {t('notFound.body')}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-default text-sm font-medium hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('notFound.home')}
          </Link>
          <Link
            to="/app/analyze"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Search className="h-4 w-4" />
            {t('notFound.analyze')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
