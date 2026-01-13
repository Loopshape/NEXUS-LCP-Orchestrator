
import React from 'react';
import { Readiness } from '../types';

interface Props {
  readiness: Readiness;
}

export const ReadinessIndicator: React.FC<Props> = ({ readiness }) => {
  const isPi = readiness === Readiness.PI || readiness === Readiness.TWO_PI;
  const isTwoPi = readiness === Readiness.TWO_PI;

  return (
    <div className="flex items-center gap-4 text-xs font-mono select-none">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isPi ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-neutral-800'}`} />
        <span className={isPi ? 'text-blue-400' : 'text-neutral-600'}>π_STATE</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isTwoPi ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-neutral-800'}`} />
        <span className={isTwoPi ? 'text-emerald-400' : 'text-neutral-600'}>2π_READY</span>
      </div>
    </div>
  );
};
