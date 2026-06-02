import { motion } from 'framer-motion';
import { usePricing } from '../../hooks/usePricing';

const ICONS = { '🗓️': '🗓', '🏘️': '🏘', '📈': '📈' };

export default function PriceReason() {
  const { priceReasons } = usePricing();

  return (
    <div>
      <p className="text-label mb-4">Why this price</p>
      <ul className="space-y-3">
        {priceReasons.map((reason, i) => (
          <motion.li
            key={reason.text}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * i, duration: 0.3 }}
            className="flex items-start gap-3 p-3 rounded-xl border text-[13px] leading-relaxed"
            style={{
              background: 'var(--color-bg-tertiary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="text-base shrink-0">{ICONS[reason.icon] ?? '·'}</span>
            {reason.text}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
