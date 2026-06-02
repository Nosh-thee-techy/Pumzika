import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export default function Landing() {
  const navigate = useNavigate();
  const { selectRole } = useRole();
  const [transitioning, setTransitioning] = useState(null);

  const pickRole = (r) => {
    setTransitioning(r);
    selectRole(r);
    setTimeout(() => {
      navigate(r === 'host' ? '/host/onboarding' : '/guest/onboarding');
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-[#141410]">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center pointer-events-none">
        <div className="font-display italic text-[32px] text-[#F7F6F3]">pumzika</div>
        <div className="text-[12px] tracking-[2px] text-[#A89E91] mt-1">Smart Rentals · Nairobi</div>
      </div>

      <div
        className={`relative flex-1 flex flex-col justify-center p-12 lg:p-16 transition-all duration-400 ease-out section-in ${
          transitioning === 'guest' ? 'opacity-0 w-0 overflow-hidden' : transitioning === 'host' ? 'lg:w-full w-full' : ''
        }`}
        style={{ animationDelay: '0s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(200,146,42,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-16">
          <p className="text-label tracking-[2px] text-[#C8922A]">For Hosts</p>
          <h1 className="font-display text-4xl lg:text-5xl text-[#F7F6F3] leading-[1.1] mt-4">
            Maximize every
            <br />
            night.
          </h1>
          <ul className="mt-6 space-y-2.5 text-[14px] text-[#A89E91]">
            {["Tonight's optimal price", '30-day demand forecast', 'Nairobi market intelligence'].map(
              (line) => (
                <li key={line} className="flex items-center gap-2">
                  <span className="text-[#C8922A]">✦</span>
                  {line}
                </li>
              )
            )}
          </ul>
          <button
            type="button"
            onClick={() => pickRole('host')}
            className="mt-10 px-6 py-3 rounded-lg border text-[14px] font-medium transition-all duration-150"
            style={{ borderColor: 'rgba(200,146,42,0.4)', color: '#C8922A' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(200,146,42,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            I&apos;m a host →
          </button>
        </div>
      </div>

      <div className="hidden lg:block w-px bg-white/[0.08] shrink-0" />

      <div
        className={`relative flex-1 flex flex-col justify-center p-12 lg:p-16 transition-all duration-400 ease-out section-in ${
          transitioning === 'host' ? 'opacity-0 w-0 overflow-hidden' : transitioning === 'guest' ? 'lg:w-full w-full' : ''
        }`}
        style={{ animationDelay: '0.1s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(13,123,110,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="max-w-md mx-auto lg:mx-0 lg:mr-auto lg:ml-16">
          <p className="text-label tracking-[2px] text-[#0D7B6E]">For Guests</p>
          <h1 className="font-display text-4xl lg:text-5xl text-[#F7F6F3] leading-[1.1] mt-4">
            Find the right
            <br />
            place, priced right.
          </h1>
          <ul className="mt-6 space-y-2.5 text-[14px] text-[#A89E91]">
            {['Is this listing worth it?', 'Best time to book', 'What guests really say'].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <span className="text-[#0D7B6E]">✦</span>
                {line}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => pickRole('guest')}
            className="mt-10 px-6 py-3 rounded-lg border text-[14px] font-medium transition-all duration-150"
            style={{ borderColor: 'rgba(13,123,110,0.4)', color: '#0D7B6E' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(13,123,110,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            I&apos;m a guest →
          </button>
        </div>
      </div>
    </div>
  );
}
