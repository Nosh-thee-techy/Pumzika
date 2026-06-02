import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

const VIBES = [
  { id: 'quiet', icon: '🌙', title: 'Quiet & Peaceful', desc: 'Away from the noise. Great for rest.' },
  { id: 'lively', icon: '🎉', title: 'Lively & Social', desc: 'Near restaurants, nightlife, energy.' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Family Friendly', desc: 'Space, safety, kid-friendly areas.' },
  { id: 'business', icon: '💼', title: 'Business Ready', desc: 'Fast WiFi, quiet, close to CBD.' },
];

export default function GuestOnboarding() {
  const navigate = useNavigate();
  const { saveGuestPrefs } = useRole();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    budgetMin: 4000,
    budgetMax: 10000,
    vibes: ['lively'],
  });

  const toggleVibe = (id) => {
    setForm((f) => ({
      ...f,
      vibes: f.vibes.includes(id) ? f.vibes.filter((v) => v !== id) : [...f.vibes, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      saveGuestPrefs(form);
      navigate('/guest/dashboard');
    }, 1000);
  };

  return (
    <div data-role="guest" className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-[40%] flex flex-col justify-between p-10 lg:p-16 text-[var(--text-inverse)] bg-[var(--bg-inverse)]">
        <div>
          <span className="font-display text-xl text-[var(--guest-accent)]">pumzika</span>
          <span className="block text-[10px] uppercase tracking-widest text-[var(--guest-accent-dark)] mt-1">for guests</span>
        </div>
        <div>
          <h1 className="font-display italic text-4xl lg:text-[40px] leading-[1.15]">
            Find your perfect
            <br />
            Nairobi stay.
          </h1>
          <div className="mt-8 p-4 rounded-r-lg border-l-[3px] border-[var(--guest-accent)]" style={{ background: 'rgba(13,123,110,0.08)' }}>
            <p className="text-[13px]">Guests who book smarter save an average of Ksh 4,200 per stay</p>
          </div>
        </div>
        <p className="text-meta text-[var(--text-muted)]">Takes 60 seconds</p>
      </aside>

      <main className="lg:w-[60%] p-8 lg:p-14 bg-white overflow-y-auto">
        <div className="max-w-lg mx-auto">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[var(--guest-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-meta mt-4">Finding your best matches...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-[26px] font-semibold">What are you looking for?</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label block mb-2">Check-in</label>
                  <input type="date" className="input" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
                </div>
                <div>
                  <label className="text-label block mb-2">Check-out</label>
                  <input type="date" className="input" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Number of guests</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, guests: g })} className={`pill ${form.guests === g ? 'pill-active' : ''}`}>
                      {g === 6 ? '6+' : g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Nightly budget (Ksh)</label>
                <input type="range" min={2000} max={25000} step={500} value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })} className="w-full accent-[var(--guest-accent)]" />
                <p className="text-meta mt-2">Ksh {form.budgetMin.toLocaleString()} — Ksh {form.budgetMax.toLocaleString()}</p>
              </div>

              <div>
                <label className="text-label block mb-1">What kind of stay?</label>
                <p className="text-meta mb-4">Select all that feel right</p>
                <div className="grid grid-cols-2 gap-4">
                  {VIBES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVibe(v.id)}
                      className={`text-left p-5 rounded-xl border transition-all duration-150 ${form.vibes.includes(v.id) ? 'border-2 border-[var(--guest-accent)] bg-[var(--guest-accent-light)]' : 'border-[var(--border-subtle)]'}`}
                    >
                      <div className="text-3xl">{v.icon}</div>
                      <div className="font-medium mt-3 text-[15px]">{v.title}</div>
                      <div className="text-meta mt-1">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 rounded-[10px]">Find my match →</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
