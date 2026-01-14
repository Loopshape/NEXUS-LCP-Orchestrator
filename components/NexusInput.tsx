
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
    <div className="flex flex-col items-center w-full">
      <form 
        onSubmit={handleSubmit}
        className={`relative w-full max-w-2xl group transition-all duration-700 ${isProcessing ? 'scale-95 opacity-60' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
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
          placeholder={disabled ? "Warming Nexus Kernel..." : "Enter logical probe or command..."}
          className="w-full bg-[#101015] border border-neutral-800 rounded-full py-5 pl-14 pr-6 text-lg focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder-neutral-700 shadow-2xl font-sans"
        />
        {isProcessing && (
          <div className="absolute inset-y-0 right-6 flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
          </div>
        )}
      </form>
      <div className="mt-3 flex justify-center gap-6 text-[10px] uppercase tracking-[0.4em] text-neutral-700 font-black">
        <span className="hover:text-neutral-500 transition-colors cursor-default">Deterministic</span>
        <span className="text-neutral-900">•</span>
        <span className="hover:text-neutral-500 transition-colors cursor-default">Multi-Agent Ensemble</span>
        <span className="text-neutral-900">•</span>
        <span className="hover:text-neutral-500 transition-colors cursor-default">Local Sovereignty</span>
      </div>
    </div>
  );
};
