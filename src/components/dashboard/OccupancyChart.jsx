import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useForecast } from '../../hooks/useForecast';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-lg px-3.5 py-2.5 text-xs"
      style={{ background: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}
    >
      <div style={{ color: 'var(--text-muted)' }}>{d.label}</div>
      <div className="text-base font-semibold mt-1" style={{ color: 'var(--accent)' }}>
        {d.occupancyPct}%
      </div>
      <div style={{ color: 'rgba(247,246,243,0.7)' }}>
        Ksh {d.recommendedPrice?.toLocaleString()}
      </div>
    </div>
  );
}

export default function OccupancyChart() {
  const { forecast } = useForecast();
  const [tab, setTab] = useState('occupancy');

  const data = forecast.map((d) => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
    occupancyPct: Math.round(d.occupancy * 100),
    revenue: Math.round(d.occupancy * d.recommendedPrice),
  }));

  const dataKey = tab === 'occupancy' ? 'occupancyPct' : 'revenue';

  return (
    <section className="card">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h3 className="text-headline">Occupancy forecast — next 30 days</h3>
        <div className="flex rounded-lg p-0.5 bg-[var(--bg-raised)] border" style={{ borderColor: 'var(--border-subtle)' }}>
          {['occupancy', 'revenue'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors duration-150 ${
                tab === t ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="occGradPro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8922A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#C8922A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-subtle)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-ui)' }}
              interval={4}
              axisLine={{ stroke: 'var(--border-subtle)' }}
              tickLine={false}
            />
            <YAxis
              domain={tab === 'occupancy' ? [0, 100] : ['auto', 'auto']}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-ui)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (tab === 'occupancy' ? `${v}%` : `${(v / 1000).toFixed(0)}k`)}
            />
            <Tooltip content={<CustomTooltip />} />
            {tab === 'occupancy' && (
              <ReferenceLine
                y={70}
                stroke="var(--border-medium)"
                strokeDasharray="4 4"
                label={{ value: 'Target', position: 'right', fill: 'var(--text-muted)', fontSize: 10 }}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#C8922A"
              strokeWidth={2}
              fill="url(#occGradPro)"
              dot={false}
              activeDot={{ r: 6, fill: '#fff', stroke: '#C8922A', strokeWidth: 2 }}
              isAnimationActive
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
