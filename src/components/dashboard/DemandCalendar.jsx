import { useState } from 'react';
import { useForecast } from '../../hooks/useForecast';
import { getDemandCellStyle } from '../../utils/forecastEngine';
import ActionPrompts from './ActionPrompts';

const LEGEND = [
  { level: 'cold', label: 'Very low' },
  { level: 'low', label: 'Low' },
  { level: 'medium', label: 'Medium' },
  { level: 'high', label: 'High' },
  { level: 'peak', label: 'Peak' },
];

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toMondayStart(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default function DemandCalendar() {
  const { forecast } = useForecast();
  const [selected, setSelected] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const firstDate = forecast[0]?.date;
  const monday = firstDate ? toMondayStart(firstDate) : new Date();
  monday.setMonth(monday.getMonth() + monthOffset);

  const monthLabel = monday.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

  const startPad = (() => {
    const d = new Date(forecast[0]?.date + 'T12:00:00');
    const day = d.getDay();
    return day === 0 ? 6 : day - 1;
  })();

  const padded = [...Array(startPad).fill(null), ...forecast];
  let cellIndex = 0;

  return (
    <section id="calendar" className="card">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h3 className="text-headline">30-Day Demand Forecast</h3>
          <p className="text-meta mt-1">Tap any date for pricing recommendation</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary py-2 px-3 text-sm"
            onClick={() => setMonthOffset((m) => m - 1)}
          >
            ←
          </button>
          <span className="btn-secondary py-2 px-3 text-sm pointer-events-none">{monthLabel}</span>
          <button
            type="button"
            className="btn-secondary py-2 px-3 text-sm"
            onClick={() => setMonthOffset((m) => m + 1)}
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-label text-center py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {padded.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const style = getDemandCellStyle(day.demandLevel);
          const isToday = day.date === todayStr;
          const idx = cellIndex++;

          return (
            <button
              key={day.date}
              type="button"
              className="calendar-cell aspect-square rounded-lg p-1 flex flex-col items-center justify-center border border-transparent transition-all duration-150 hover:shadow-[var(--shadow-raised)] hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              style={{
                background: style.bg,
                color: style.text,
                animationDelay: `${idx * 20}ms`,
                borderColor: isToday ? 'var(--accent)' : 'transparent',
                borderWidth: isToday ? 2 : 1,
              }}
              onClick={() => setSelected(day)}
            >
              <span className="text-[13px] font-medium">
                {new Date(day.date + 'T12:00:00').getDate()}
              </span>
              <span className="text-[11px] opacity-80">
                {(day.recommendedPrice / 1000).toFixed(1).replace('.0', '')}k
              </span>
              {day.event && (
                <span
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{
                    background: day.event.type === 'holiday' ? 'var(--accent)' : '#4a90d9',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="mt-6 p-4 rounded-lg border max-w-xs"
          style={{ boxShadow: 'var(--shadow-float)', borderColor: 'var(--border-subtle)' }}
        >
          <p className="font-semibold text-sm">
            {new Date(selected.date + 'T12:00:00').toLocaleDateString('en-KE', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--accent)' }}>
            Ksh {selected.recommendedPrice.toLocaleString()}
          </p>
          <p className="text-meta mt-1">
            {Math.round(selected.occupancy * 100)}% forecast occupancy
          </p>
          <p className="text-body text-[13px] mt-2">{selected.reason}</p>
          <button type="button" className="btn-primary mt-4 text-sm py-2">
            Set this price
          </button>
        </div>
      )}

      <hr className="divider" />

      <div className="flex flex-wrap justify-center gap-4">
        {LEGEND.map(({ level, label }) => {
          const s = getDemandCellStyle(level);
          return (
            <div key={level} className="flex items-center gap-2 text-meta">
              <span className="w-3 h-3 rounded-full" style={{ background: s.bg, border: '1px solid var(--border-subtle)' }} />
              {label}
            </div>
          );
        })}
      </div>

      <ActionPrompts />
    </section>
  );
}
