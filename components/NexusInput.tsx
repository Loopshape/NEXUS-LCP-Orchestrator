
import React, { useState, useRef, useEffect } from 'react';
import { Search, Hash, RefreshCcw } from 'lucide-react';

interface Props {
  onSend: (input: string) => void;
  disabled: boolean;
  isProcessing: boolean;
}

const STORAGE_KEY = 'nexus_lcp_input_history';

export const NexusInput: React.FC<Props> = ({ onSend, disabled, isProcessing }) => {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!disabled && !isProcessing) {
      inputRef.current?.focus();
    }
  }, [disabled, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled && !isProcessing) {
      const newHistory = [value, ...history.filter(h => h !== value)].slice(0, 50);
      setHistory(newHistory);
      setHistoryIndex(-1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      
      onSend(value);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < history.length) {
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setValue('');
      }
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative w-full max-w-3xl group transition-all duration-500 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {value.toLowerCase().includes('hash') ? (
          <Hash className="w-5 h-5 text-blue-400" />
        ) : value.toLowerCase().includes('rehash') ? (
          <RefreshCcw className="w-5 h-5 text-emerald-400 animate-spin-slow" />
        ) : (
          <Search className="w-5 h-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setHistoryIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled || isProcessing}
        placeholder={disabled ? "Warming Nexus..." : "Enter logical continuum prompt..."}
        className="w-full bg-[#151515] border border-neutral-800 rounded-full py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-neutral-600"
      />
      {isProcessing && (
        <div className="absolute inset-y-0 right-4 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        </div>
      )}
      <div className="mt-2 flex justify-center gap-4 text-[10px] uppercase tracking-widest text-neutral-600 mono">
        <span>Deterministic</span>
        <span className="text-neutral-800">•</span>
        <span>Asynchronous Ensemble</span>
        <span className="text-neutral-800">•</span>
        <span>Sovereign Runtime</span>
      </div>
    </form>
  );
};
