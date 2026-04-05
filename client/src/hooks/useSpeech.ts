import { useState, useCallback, useRef } from 'react';

// Text-to-Speech
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = lang;
    utter.rate  = 0.95;
    utter.pitch = 1;

    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return { speak, stop, speaking, supported };
}

// Speech-to-Text (Web Speech API)
type STTStatus = 'idle' | 'listening' | 'error';

export function useSTT(onResult: (transcript: string) => void) {
  const [status, setStatus] = useState<STTStatus>('idle');
  const recogRef = useRef<SpeechRecognition | null>(null);

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback((lang = 'en-US') => {
    if (!supported) return;
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = lang;
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart  = () => setStatus('listening');
    recog.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
      setStatus('idle');
    };
    recog.onerror = () => setStatus('error');
    recog.onend   = () => setStatus(s => s === 'listening' ? 'idle' : s);

    recogRef.current = recog;
    recog.start();
  }, [supported, onResult]);

  const stop = useCallback(() => {
    recogRef.current?.stop();
    setStatus('idle');
  }, []);

  return { start, stop, status, supported };
}
