import { useState, useCallback, useRef } from 'react';
import { useProperty } from '../context/PropertyContext';

const MOCK_RESPONSES = {
  lower:
    'Not this weekend — Madaraka Day is driving demand up 34% in your area. Push to Ksh {price} and you will still fill up faster than last month.',
  busy:
    'Your next busy window starts {date} — occupancy hits {occ}%. Price up 10–15% three days before.',
  amenities:
    'Add a generator and secure parking — Kilimani guests pay 8–12% more for both. WiFi you already have covered.',
  compare:
    'You are priced {dir} the Kilimani average for {bedrooms}. Tonight Ksh {price} puts you in the sweet spot for bookings.',
  default:
    'Based on your Kilimani listing, keep tonight at Ksh {price}. Demand is {level} — similar 2BR units are filling at that rate.',
};

function buildSystemPrompt(property, neighborhood, recommendedPrice, forecastSummary, demandScore) {
  return `You are Pumzika AI, a smart rental pricing assistant for Nairobi hosts.
You have access to the following property context:
- Property: ${property?.name ?? 'Host property'}
- Neighborhood: ${property?.neighborhood ?? neighborhood?.name}
- Bedrooms: ${property?.bedrooms}
- Current price: Ksh ${property?.currentPrice ?? 'unknown'}
- Recommended price tonight: Ksh ${recommendedPrice}
- 30-day occupancy forecast: ${forecastSummary}
- Neighborhood demand score: ${demandScore}/100

Answer the host's question in 2-3 sentences max.
Be specific, use Ksh prices, reference their neighborhood.
Be warm but direct — like a smart friend who knows the Nairobi rental market.
Never use jargon. Always give a clear recommendation.`;
}

function getMockResponse(question, ctx) {
  const q = question.toLowerCase();
  const { recommendedPrice, property, neighborhood, forecast } = ctx;
  const peak = forecast?.find((d) => d.demandLevel === 'peak' || d.demandLevel === 'high');

  let template = MOCK_RESPONSES.default;
  if (q.includes('lower') || q.includes('weekend')) template = MOCK_RESPONSES.lower;
  else if (q.includes('busy')) template = MOCK_RESPONSES.busy;
  else if (q.includes('amenit')) template = MOCK_RESPONSES.amenities;
  else if (q.includes('compare') || q.includes('similar')) template = MOCK_RESPONSES.compare;

  const dir =
    (property?.currentPrice ?? 0) < recommendedPrice ? 'below' : 'at or above';

  return template
    .replace('{price}', recommendedPrice?.toLocaleString() ?? '8,500')
    .replace('{date}', peak?.date ?? 'this Friday')
    .replace('{occ}', peak ? `${Math.round(peak.occupancy * 100)}%` : '85%')
    .replace('{bedrooms}', property?.bedrooms ?? '2 BR')
    .replace('{dir}', dir)
    .replace('{level}', neighborhood?.demandScore > 75 ? 'high' : 'steady');
}

export function useVoiceAgent() {
  const { property, neighborhood, recommendedPrice, forecastSummary, forecast } =
    useProperty();
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const recognitionRef = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-KE';
    window.speechSynthesis.speak(utterance);
  }, []);

  const askClaude = useCallback(
    async (userText) => {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const systemPrompt = buildSystemPrompt(
        property,
        neighborhood,
        recommendedPrice,
        forecastSummary,
        neighborhood?.demandScore ?? 80
      );

      if (!apiKey) {
        return getMockResponse(userText, {
          recommendedPrice,
          property,
          neighborhood,
          forecast,
        });
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: 'user', content: userText }],
        }),
      });

      if (!res.ok) {
        return getMockResponse(userText, {
          recommendedPrice,
          property,
          neighborhood,
          forecast,
        });
      }

      const data = await res.json();
      const block = data.content?.find((c) => c.type === 'text');
      return block?.text ?? getMockResponse(userText, { recommendedPrice, property, neighborhood, forecast });
    },
    [property, neighborhood, recommendedPrice, forecastSummary, forecast]
  );

  const processQuestion = useCallback(
    async (text) => {
      if (!text?.trim()) return;
      setIsThinking(true);
      const userMsg = { role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const answer = await askClaude(text.trim());
        const aiMsg = { role: 'assistant', content: answer };
        setMessages((prev) => [...prev, aiMsg]);
        speak(answer);
      } catch {
        const fallback = getMockResponse(text, {
          recommendedPrice,
          property,
          neighborhood,
          forecast,
        });
        setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
        speak(fallback);
      } finally {
        setIsThinking(false);
        setTranscript('');
      }
    },
    [askClaude, speak, recommendedPrice, property, neighborhood, forecast]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript('Voice not supported — type a question below');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-KE';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) processQuestion(final);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [processQuestion]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    if (transcript) processQuestion(transcript);
  }, [transcript, processQuestion]);

  const askText = useCallback(
    (text) => {
      setTranscript(text);
      processQuestion(text);
    },
    [processQuestion]
  );

  return {
    isListening,
    isThinking,
    transcript,
    messages,
    startListening,
    stopListening,
    askText,
    speak,
  };
}
