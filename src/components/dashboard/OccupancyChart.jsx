import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useForecast } from '../../hooks/useForecast';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-xs border"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ color: 'var(--text-muted)' }}>{d.label}</div>
      <div className="text-base font-semibold font-display mt-1" style={{ color: 'var(--accent)' }}>
        {d.occupancyPct}% occupancy
      </div>
      <div style={{ color: 'var(--text-secondary)' }}>
        Ksh {d.recommendedPrice?.toLocaleString()} recommended
      </div>
    </div>
  );
}

export default function OccupancyChart({ compact = false }) {
  const { forecast } = useForecast();

  const data = forecast.map((d) => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
    }),
    occupancyPct: Math.round(d.occupancy * 100),
  }));

  return (
    <div className={compact ? 'card' : 'card'}>
      <h3 className="text-label mb-4">Occupancy forecast</h3>

      <div className={compact ? 'h-[160px]' : 'h-[200px]'}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="occGradDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5A623" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#F5A623" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-subtle)" />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                interval={compact ? 6 : 4}
                axisLine={{ stroke: 'var(--border-subtle)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="occupancyPct"
                stroke="#F5A623"
                strokeWidth={2}
                fill="url(#occGradDark)"
                dot={false}
                activeDot={{ r: 5, fill: '#F5A623', stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
}
