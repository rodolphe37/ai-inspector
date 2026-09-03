import { useEffect, useState } from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AuthPanel } from './AuthPanel';
import { useQuotaStore } from '@/stores/useQuotaStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useHistoryStore } from '@/stores/useHistoryStore';

function formatReset(iso: string | null): string {
  if (!iso) return '';
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'now';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.round((ms % 3_600_000) / 60_000);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

export function SignUpModal() {
  const { modalOpen, closeModal, blockedUntil, quota, refresh } = useQuotaStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!modalOpen) return;
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, [modalOpen]);

  const exhausted =
    blockedUntil != null || (quota != null && !quota.unlimited && (quota.remaining ?? 1) <= 0);

  const onSuccess = async () => {
    closeModal();
    useQuotaStore.setState({ blockedUntil: null });
    await refresh();
    void useSettingsStore.getState().load();
    void useHistoryStore.getState().load();
  };

  return (
    <Modal open={modalOpen} onClose={closeModal} title={exhausted ? 'Free scan limit reached' : 'Create your account'} size="md">
      <div className="space-y-4">
        {exhausted && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <Clock className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted">
              You've used all {quota?.limit ?? 5} free scans for this period. They reset{' '}
              <span className="text-content font-medium">{formatReset(blockedUntil ?? quota?.resetsAt ?? null)}</span>.
              Create an account to keep going now — Pro and Premium include analysis history,
              C2PA, statistical analysis and larger files.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-subtle">
          <ShieldCheck className="h-3.5 w-3.5" />
          Content is analysed in your browser. Your account stores only what you choose to keep.
        </div>

        <AuthPanel mode="register" plan="pro" showPlanPicker onSuccess={onSuccess} />

        <button
          onClick={closeModal}
          className="w-full text-center text-xs text-subtle hover:text-muted pt-1"
        >
          {exhausted ? 'Not now — I\'ll wait for the reset' : 'Continue without an account'}
        </button>
      </div>
    </Modal>
  );
}
