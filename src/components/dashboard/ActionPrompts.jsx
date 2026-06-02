import { motion } from 'framer-motion';
import { useForecast } from '../../hooks/useForecast';

const STYLES = {
  urgent: { border: 'var(--negative)', label: '🔴 Urgent', color: 'var(--negative)' },
  week: { border: 'var(--accent)', label: '🟡 This week', color: 'var(--accent)' },
  plan: { border: 'var(--positive)', label: '🟢 Plan ahead', color: 'var(--positive)' },
};

export default function ActionPrompts() {
  const { actionPrompts } = useForecast();

  return (
    <div className="grid md:grid-cols-3 gap-4 mt-6">
      {actionPrompts.map((prompt, i) => {
        const s = STYLES[prompt.urgency] ?? STYLES.plan;
        return (
          <motion.div
            key={prompt.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.35 }}
            className="p-4 rounded-xl border"
            style={{
              background: 'var(--color-bg-tertiary)',
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
          </motion.div>
        );
      })}
    </div>
  );
}
