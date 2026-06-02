import { useState } from 'react';
import { Mic, Volume2, Loader2 } from 'lucide-react';
import { useVoiceAgent } from '../../hooks/useVoiceAgent';

const SUGGESTIONS = [
  'Should I lower my price this weekend?',
  'When is my next busy period?',
  'What amenities should I add to earn more?',
  'How do I compare to nearby listings?',
];

export default function VoiceAgent() {
  const {
    isListening,
    isThinking,
    transcript,
    messages,
    startListening,
    stopListening,
    askText,
    speak,
  } = useVoiceAgent();
  const [textInput, setTextInput] = useState('');
  const showSuggestions = !isListening && !isThinking && messages.length === 0;

  const handleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const stateLabel = isThinking ? 'Thinking...' : isListening ? 'Listening...' : 'Tap to ask';

  return (
    <div className="min-h-full flex flex-col items-center px-4 py-12 lg:py-16 bg-[var(--bg-canvas)]">
      <div className="text-center max-w-[600px] w-full">
        <p className="text-label">Ask Pumzika AI</p>
        <h1 className="text-[28px] font-semibold tracking-tight mt-2">Your pricing advisor</h1>
        <p className="text-meta mt-1">Ask anything about your pricing or market</p>

        <div className="mt-12 flex flex-col items-center">
          <button
            type="button"
            onClick={handleMic}
            disabled={isThinking}
            className={`w-20 h-20 rounded-full flex items-center justify-center bg-[var(--bg-surface)] border transition-all duration-150 ${
              isListening ? 'mic-listening border-2' : 'hover:shadow-[var(--shadow-raised)] hover:scale-[1.02]'
            }`}
            style={{
              borderColor: isListening ? 'var(--accent)' : 'var(--border-medium)',
              boxShadow: isListening
                ? '0 0 0 8px rgba(200,146,42,0.08), 0 0 0 16px rgba(200,146,42,0.04), var(--shadow-raised)'
                : 'var(--shadow-raised)',
            }}
          >
            {isThinking ? (
              <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent)' }} />
            ) : (
              <Mic size={28} style={{ color: isListening ? 'var(--accent)' : 'var(--text-muted)' }} />
            )}
          </button>
          <p className="text-meta mt-3">{stateLabel}</p>
        </div>

        {isListening && transcript && (
          <p className="mt-8 text-base text-center italic max-w-md mx-auto" style={{ color: 'var(--text-primary)' }}>
            {transcript}
          </p>
        )}

        {showSuggestions && (
          <div className="mt-10 w-full max-w-lg">
            <p className="text-label text-center mb-3">Try asking</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => askText(q)}
                  className="text-left p-3 rounded-lg border bg-[var(--bg-surface)] text-[13px] transition-colors duration-150 hover:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          className="mt-8 flex gap-2 max-w-md mx-auto w-full"
          onSubmit={(e) => {
            e.preventDefault();
            if (textInput.trim()) {
              askText(textInput);
              setTextInput('');
            }
          }}
        >
          <input
            className="input flex-1"
            placeholder="Or type your question..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Ask
          </button>
        </form>
      </div>

      <div className="w-full max-w-[560px] mt-10 space-y-4">
        {messages.map((msg, i) => (
          <div key={`${msg.role}-${i}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-xl ${
                msg.role === 'user'
                  ? 'rounded-br-sm'
                  : 'rounded-bl-sm border-l-[3px] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]'
              }`}
              style={
                msg.role === 'user'
                  ? { background: 'var(--bg-inverse)', color: 'var(--text-inverse)' }
                  : { borderLeftColor: 'var(--accent)', color: 'var(--text-secondary)' }
              }
            >
              {msg.content}
              {msg.role === 'assistant' && (
                <button
                  type="button"
                  className="flex items-center gap-1 mt-2 text-meta hover:text-[var(--accent-dark)] transition-colors"
                  onClick={() => speak(msg.content)}
                >
                  <Volume2 size={12} /> Replay
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {messages.length > 0 && !isThinking && !isListening && (
        <p className="text-meta mt-8">Ask another question</p>
      )}
    </div>
  );
}
