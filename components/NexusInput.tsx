
import React, { useState, useRef, useEffect } from 'react';
import { Search, Hash, RefreshCcw } from 'lucide-react';

interface Props {
  onSend: (input: string) => void;
  disabled: boolean;
  isProcessing: boolean;
}

export const NexusInput: React.FC<Props> = ({ onSend, disabled, isProcessing }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && !isProcessing) {
      inputRef.current?.focus();
    }
  }, [disabled, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled && !isProcessing) {
      onSend(value);
      setValue('');
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
        onChange={(e) => setValue(e.target.value)}
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
