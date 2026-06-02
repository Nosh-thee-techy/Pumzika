import { useForecast } from '../../hooks/useForecast';

const STYLES = {
  urgent: { border: 'var(--negative)', label: 'Urgent', color: 'var(--negative)' },
  week: { border: 'var(--accent)', label: 'This week', color: 'var(--accent-dark)' },
  plan: { border: 'var(--positive)', label: 'Plan ahead', color: 'var(--positive)' },
};

export default function ActionPrompts() {
  const { actionPrompts } = useForecast();

  return (
    <div className="grid md:grid-cols-3 gap-4 mt-6">
      {actionPrompts.map((prompt) => {
        const s = STYLES[prompt.urgency] ?? STYLES.plan;
        return (
          <div
            key={prompt.text}
            className="p-4 rounded-lg border"
            style={{
              background: 'var(--bg-raised)',
              borderColor: 'var(--border-subtle)',
              borderLeftWidth: 3,
              borderLeftColor: s.border,
            }}
          >
            <p className="text-label" style={{ color: s.color }}>
              {s.label}
            </p>
            <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {prompt.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
