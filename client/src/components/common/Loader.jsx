import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', size = 'default' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className={`animate-spin text-sky-700 ${size === 'small' ? 'h-5 w-5' : 'h-8 w-8'}`} />
      {message && <p className="mt-3 text-xs font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export default Loader;

