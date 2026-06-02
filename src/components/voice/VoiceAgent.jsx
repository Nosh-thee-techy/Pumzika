import { useState } from 'react';
import { Mic, Volume2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVoiceAgent } from '../../hooks/useVoiceAgent';

const SUGGESTIONS = [
  'Should I lower my price this weekend?',
  'When is my next busy period?',
  'What amenities should I add to earn more?',
  'How do I compare to similar listings in Kilimani?',
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
    <div className="min-h-full flex flex-col items-center px-4 py-12 lg:py-16 ask-page-bg">
      <div className="text-center max-w-[680px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-2 ${
              isListening ? 'mic-listening' : ''
            }`}
            style={{
              borderColor: isListening ? 'var(--accent)' : 'var(--border-subtle)',
              background: 'var(--color-bg-secondary)',
            }}
          >
            <Mic size={36} style={{ color: 'var(--accent)' }} />
          </div>

          <h1 className="font-display text-4xl font-extrabold">Ask Pumzika AI</h1>
          <p className="text-body mt-2 italic">
            Ask anything about your pricing, demand, or market
          </p>
        </motion.div>

        <div className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleMic}
            disabled={isThinking}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-150 ${
              isListening ? 'mic-listening' : 'hover:scale-[1.03]'
            }`}
            style={{
              borderColor: isListening ? 'var(--accent)' : 'var(--border-medium)',
              background: 'var(--color-bg-secondary)',
            }}
          >
            {isThinking ? (
              <Loader2 className="animate-spin" size={28} style={{ color: 'var(--accent)' }} />
            ) : (
              <Mic size={28} style={{ color: isListening ? 'var(--accent)' : 'var(--text-muted)' }} />
            )}
          </button>
          <p className="text-meta mt-3">{stateLabel}</p>
        </div>

        {isListening && transcript && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-base text-center italic max-w-md mx-auto"
          >
            &ldquo;{transcript}&rdquo;
          </motion.p>
        )}

        {showSuggestions && (
          <div className="mt-10 w-full">
            <p className="text-label text-center mb-3">Try asking</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => askText(q)}
                  className="chip cursor-pointer hover:border-[var(--accent)] transition-colors"
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
          <motion.div
            key={`${msg.role}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-2xl ${
                msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md border-l-[3px]'
              }`}
              style={
                msg.role === 'user'
                  ? { background: 'var(--color-bg-elevated)', color: 'var(--text-primary)' }
                  : {
                      background: 'var(--color-bg-tertiary)',
                      borderLeftColor: 'var(--accent)',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {msg.content}
              {msg.role === 'assistant' && (
                <button
                  type="button"
                  className="flex items-center gap-1 mt-2 text-meta hover:opacity-80 transition-opacity"
                  onClick={() => speak(msg.content)}
                >
                  <Volume2 size={12} /> Replay
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {messages.length > 0 && !isThinking && !isListening && (
        <p className="text-meta mt-8">Ask another question</p>
      )}
    </div>
  );
}
