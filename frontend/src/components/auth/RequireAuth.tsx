import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { can, type Feature } from '@/lib/plans';
import { UpgradePrompt } from './UpgradePrompt';

function FullPageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

/** Gate a route on being signed in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

/** Gate content on a plan feature; render an upgrade prompt otherwise. */
export function RequirePlan({
  feature,
  children,
  title,
}: {
  feature: Feature;
  children: ReactNode;
  title?: string;
}) {
  const plan = useAuthStore((s) => s.plan);
  const status = useAuthStore((s) => s.status);
  if (status === 'loading') return <FullPageLoader />;
  if (!can(plan, feature)) {
    return <UpgradePrompt feature={feature} title={title} currentPlan={plan} />;
  }
  return <>{children}</>;
}
