import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../../lib/api';

interface CalendarDay {
  date: string;
  count: number;
}

function intensity(count: number): string {
  if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
  if (count < 5)   return 'bg-indigo-200 dark:bg-indigo-900';
  if (count < 15)  return 'bg-indigo-400 dark:bg-indigo-600';
  return 'bg-indigo-600 dark:bg-indigo-400';
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StreakCalendar({ streak }: { streak: number }) {
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [tooltip, setTooltip]   = useState<{ x: number; y: number; text: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ calendar: CalendarDay[] }>('/stats/calendar?days=91')
      .then(d => setCalendar(d.calendar))
      .catch(() => {});
  }, []);

  if (calendar.length === 0) return null;

  // Pad so grid starts on Sunday
  const firstDay = new Date(calendar[0].date + 'T00:00:00');
  const padBefore = firstDay.getDay(); // 0=Sun
  const padded: (CalendarDay | null)[] = [
    ...Array(padBefore).fill(null),
    ...calendar,
  ];
  // Fill to complete last week
  while (padded.length % 7 !== 0) padded.push(null);

  // Build weeks (columns)
  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month labels: find first occurrence of each month in the weeks
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstReal = week.find(d => d !== null);
    if (firstReal) {
      const m = new Date(firstReal.date + 'T00:00:00').getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col, label: MONTHS[m] });
        lastMonth = m;
      }
    }
  });

  const totalCards = calendar.reduce((s, d) => s + d.count, 0);
  const activeDays = calendar.filter(d => d.count > 0).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Study Activity</h2>
          <p className="text-xs text-slate-400 mt-0.5">{activeDays} active days · {totalCards} cards studied</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950 rounded-xl">
          <span className="text-base">🔥</span>
          <span className="font-black text-orange-500 text-sm">{streak}</span>
          <span className="text-xs text-orange-400">day streak</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div ref={containerRef} className="relative overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-1" style={{ paddingLeft: 28 }}>
          {weeks.map((_, col) => {
            const label = monthLabels.find(m => m.col === col);
            return (
              <div key={col} className="flex-shrink-0 text-xs text-slate-400" style={{ width: 14, marginRight: 2 }}>
                {label ? label.label : ''}
              </div>
            );
          })}
        </div>

        <div className="flex gap-0.5">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
            {DAYS.map((day, i) => (
              <div key={day} className="text-xs text-slate-400 flex items-center" style={{ height: 12, width: 24, visibility: i % 2 === 1 ? 'visible' : 'hidden' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, col) => (
            <div key={col} className="flex flex-col gap-0.5 flex-shrink-0">
              {week.map((day, row) => (
                <div
                  key={row}
                  className={`w-3 h-3 rounded-sm cursor-default transition-opacity ${day ? intensity(day.count) : 'bg-transparent'}`}
                  onMouseEnter={e => {
                    if (!day) return;
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    const containerRect = containerRef.current!.getBoundingClientRect();
                    setTooltip({
                      x: rect.left - containerRect.left + 6,
                      y: rect.top - containerRect.top - 30,
                      text: `${day.date}: ${day.count} card${day.count !== 1 ? 's' : ''}`,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg pointer-events-none whitespace-nowrap shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}>
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-xs text-slate-400">Less</span>
        {['bg-slate-100 dark:bg-slate-800', 'bg-indigo-200 dark:bg-indigo-900', 'bg-indigo-400 dark:bg-indigo-600', 'bg-indigo-600 dark:bg-indigo-400'].map(cls => (
          <div key={cls} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-xs text-slate-400">More</span>
      </div>
    </div>
  );
}
