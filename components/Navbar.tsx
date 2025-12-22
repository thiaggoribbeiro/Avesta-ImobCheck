
import React from 'react';

interface NavbarProps {
  title: string;
  userName?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ title, userName, showBack, onBack, actions }) => {
  return (
    <div className="sticky top-0 z-20 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-3 justify-between border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">{title}</h2>
          {userName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="material-symbols-outlined text-xs align-middle mr-1">person</span>
              {userName}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </div>
  );
};

export default Navbar;
