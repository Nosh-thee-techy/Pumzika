import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const HOST_FEATURES = [
  { label: "Tonight's optimal price", hint: 'Live market signal' },
  { label: '30-day demand forecast', hint: 'Prophet + seasonality' },
  { label: 'Nairobi market intelligence', hint: '47 counties mapped' },
];

const GUEST_FEATURES = [
  { label: 'Is this listing worth it?', hint: 'Fairness score' },
  { label: 'Best time to book', hint: 'Demand calendar' },
  { label: 'What guests really say', hint: 'Sentiment insights' },
];

function FeatureRow({ accent, label, hint }) {
  return (
    <li className="landing-feature">
      <span className="landing-feature-dot" style={{ '--feature-accent': accent }} />
      <span>
        <span className="landing-feature-label">{label}</span>
        <span className="landing-feature-hint">{hint}</span>
      </span>
    </li>
  );
}

function PreviewCard({ role, accent, children }) {
  return (
    <div className="landing-preview" style={{ '--preview-accent': accent }} data-role={role}>
      {children}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { selectRole } = useRole();
  const [transitioning, setTransitioning] = useState(null);
  const [hovered, setHovered] = useState(null);

  const pickRole = (r) => {
    setTransitioning(r);
    selectRole(r);
    setTimeout(() => {
      navigate(r === 'host' ? '/host/onboarding' : '/guest/onboarding');
    }, 450);
  };

  const hostDimmed = hovered === 'guest' && !transitioning;
  const guestDimmed = hovered === 'host' && !transitioning;

  return (
    <div className="landing-page">
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-orb landing-orb-host" />
        <div className="landing-orb landing-orb-guest" />
        <div className="landing-grid" />
      </div>

      <header className="landing-header section-in">
        <div className="landing-brand">
          <span className="landing-brand-mark">pumzika</span>
          <span className="landing-brand-tag">Smart Rentals · Nairobi</span>
        </div>
      </header>

      <main className="landing-main">
        <section
          className={`landing-panel landing-panel-host section-in ${
            transitioning === 'guest' ? 'landing-panel-exit' : transitioning === 'host' ? 'landing-panel-expand' : ''
          } ${hostDimmed ? 'landing-panel-dim' : ''}`}
          style={{ animationDelay: '0.05s' }}
          onMouseEnter={() => setHovered('host')}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="landing-panel-inner">
            <div className="landing-panel-copy">
              <p className="landing-eyebrow landing-eyebrow-host">For Hosts</p>
              <h1 className="landing-headline">
                Maximize every
                <br />
                <em>night.</em>
              </h1>
              <p className="landing-lede">
                Turn market data into nightly revenue — pricing, demand, and neighborhood intelligence in one place.
              </p>

              <ul className="landing-features">
                {HOST_FEATURES.map((f) => (
                  <FeatureRow key={f.label} accent="#C8922A" {...f} />
                ))}
              </ul>

              <button type="button" className="landing-cta landing-cta-host" onClick={() => pickRole('host')}>
                <span>I&apos;m a host</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <PreviewCard role="host" accent="#C8922A">
              <p className="landing-preview-label">Tonight&apos;s signal</p>
              <p className="landing-preview-value">Ksh 12,400</p>
              <p className="landing-preview-meta">
                <span className="landing-preview-up">↑ 8%</span> vs. your current rate
              </p>
              <div className="landing-preview-bars">
                {[42, 68, 55, 82, 71, 94, 88].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="landing-preview-foot">Westlands · High demand week</p>
            </PreviewCard>
          </div>
        </section>

        <div className="landing-divider" aria-hidden="true">
          <span className="landing-divider-line" />
          <span className="landing-divider-dot" />
          <span className="landing-divider-line" />
        </div>

        <section
          className={`landing-panel landing-panel-guest section-in ${
            transitioning === 'host' ? 'landing-panel-exit' : transitioning === 'guest' ? 'landing-panel-expand' : ''
          } ${guestDimmed ? 'landing-panel-dim' : ''}`}
          style={{ animationDelay: '0.12s' }}
          onMouseEnter={() => setHovered('guest')}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="landing-panel-inner landing-panel-inner-reverse">
            <div className="landing-panel-copy">
              <p className="landing-eyebrow landing-eyebrow-guest">For Guests</p>
              <h1 className="landing-headline">
                Find the right place,
                <br />
                <em>priced right.</em>
              </h1>
              <p className="landing-lede">
                Know before you book — fairness scores, timing signals, and what other guests actually experienced.
              </p>

              <ul className="landing-features">
                {GUEST_FEATURES.map((f) => (
                  <FeatureRow key={f.label} accent="#0D7B6E" {...f} />
                ))}
              </ul>

              <button type="button" className="landing-cta landing-cta-guest" onClick={() => pickRole('guest')}>
                <span>I&apos;m a guest</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <PreviewCard role="guest" accent="#0D7B6E">
              <p className="landing-preview-label">Price fairness</p>
              <div className="landing-fairness-ring">
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="#0D7B6E"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="160 54"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <span className="landing-fairness-score">94</span>
              </div>
              <p className="landing-preview-meta landing-preview-fair">Great value for Kilimani</p>
              <div className="landing-preview-tags">
                <span>Walkable</span>
                <span>Quiet</span>
                <span>Safe area</span>
              </div>
            </PreviewCard>
          </div>
        </section>
      </main>

      <footer className="landing-footer section-in" style={{ animationDelay: '0.2s' }}>
        <span>Powered by XGBoost · Prophet · Claude</span>
      </footer>
    </div>
  );
}
