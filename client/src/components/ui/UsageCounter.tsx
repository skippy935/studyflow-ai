import { useState } from 'react';
import UpgradeModal from './UpgradeModal';

interface Props {
  label: string;
  used: number;
  limit: number | null;
  periodLabel?: string; // e.g. "heute" or "diesen Monat"
  warnAt?: number; // percent threshold to show warning colour (default 80)
}

export default function UsageCounter({
  label,
  used,
  limit,
  periodLabel,
  warnAt = 80,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  if (limit === null || limit === Infinity) return null;

  const percent = Math.min(100, Math.round((used / limit) * 100));
  const remaining = Math.max(0, limit - used);
  const isWarn = percent >= warnAt && percent < 100;
  const isDepleted = percent >= 100;

  const barColour = isDepleted
    ? 'bg-red-500'
    : isWarn
    ? 'bg-amber-500'
    : 'bg-indigo-500';

  const textColour = isDepleted
    ? 'text-red-600 dark:text-red-400'
    : isWarn
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-slate-500 dark:text-slate-400';

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
          <span className={textColour}>
            {isDepleted ? (
              <button
                onClick={() => setShowModal(true)}
                className="underline font-semibold"
              >
                Limit erreicht — Upgrade
              </button>
            ) : (
              `${remaining} verbleibend${periodLabel ? ` ${periodLabel}` : ''}`
            )}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColour}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {showModal && (
        <UpgradeModal
          onClose={() => setShowModal(false)}
          message={`Du hast dein ${label}-Limit für ${periodLabel ?? 'diesen Zeitraum'} erreicht.`}
        />
      )}
    </>
  );
}
