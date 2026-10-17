import React from 'react';

interface SalihHeroBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const SalihHeroBadge: React.FC<SalihHeroBadgeProps> = ({ size = 'md', showLabel = true }) => {
  const dim = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-32 h-32' : 'w-20 h-20';

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${dim} rounded-full ring-2 ring-amber-400/80 shadow-2xl overflow-hidden bg-gradient-to-b from-sky-400 via-amber-200 to-amber-700 p-0.5`}>
        {/* Sky background behind character */}
        <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-t from-amber-900 via-rose-950 to-sky-600 flex items-center justify-center">
          {/* Subtle clouds & airdrop parachute in bg */}
          <div className="absolute top-1 left-2 w-4 h-1.5 bg-white/40 rounded-full blur-[0.5px]" />
          <div className="absolute top-2 right-3 w-3 h-1 bg-white/30 rounded-full blur-[0.5px]" />
          <div className="absolute top-1 right-5 w-2 h-2 rounded-full border-t-2 border-slate-900/60" />

          {/* Salih Character Vector Avatar matching photo */}
          <svg viewBox="0 0 100 100" className="w-full h-full mt-1">
            {/* Dark tactical cargo pants */}
            <path d="M35 88 L65 88 L62 100 L38 100 Z" fill="#1e222b" />

            {/* Maroon / Burgundy Collared Shirt */}
            <path d="M22 62 Q30 52 50 52 Q70 52 78 62 L82 88 L18 88 Z" fill="#881337" />
            {/* White buttons */}
            <circle cx="50" cy="62" r="1.5" fill="#f8fafc" />
            <circle cx="50" cy="71" r="1.5" fill="#f8fafc" />
            <circle cx="50" cy="80" r="1.5" fill="#f8fafc" />

            {/* Tactical black backpack straps */}
            <path d="M33 54 L36 88 L40 88 L37 54 Z" fill="#18181b" />
            <path d="M67 54 L64 88 L60 88 L63 54 Z" fill="#18181b" />

            {/* Neck */}
            <rect x="44" y="44" width="12" height="12" fill="#e5ab82" rx="2" />
            {/* Shirt collar tabs */}
            <polygon points="40,54 48,54 44,60" fill="#9f1239" />
            <polygon points="60,54 52,54 56,60" fill="#9f1239" />

            {/* Face */}
            <ellipse cx="50" cy="35" rx="15" ry="17" fill="#e5ab82" />

            {/* Trimmed beard & stubble */}
            <path d="M38 35 Q40 50 50 51 Q60 50 62 35 Q60 47 50 48 Q40 47 38 35 Z" fill="#1c1917" opacity="0.85" />
            {/* Mustache */}
            <path d="M44 42 Q50 40 56 42 Q50 44 44 42 Z" fill="#1c1917" />

            {/* Friendly Smile with teeth */}
            <path d="M44 44 Q50 48 56 44" stroke="#881337" strokeWidth="1.2" fill="none" />
            <path d="M46 44.5 Q50 46.5 54 44.5" fill="#ffffff" />

            {/* Eyes */}
            <ellipse cx="44" cy="33" rx="2" ry="1.4" fill="#1c1917" />
            <ellipse cx="56" cy="33" rx="2" ry="1.4" fill="#1c1917" />
            {/* Eyebrows */}
            <path d="M41 29 Q44 28 47 30" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M59 29 Q56 28 53 30" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Styled Dark Quiff Hair from photo */}
            <path d="M34 32 Q32 17 50 16 Q66 15 67 28 Q67 36 65 37 Q60 22 48 24 Q37 26 34 32 Z" fill="#18181b" />
            <path d="M45 16 Q54 13 60 17 Q54 16 48 18 Z" fill="#27272a" />

            {/* Salih's Cyber Blue LED Rifle held across chest */}
            <rect x="25" y="70" width="50" height="7" fill="#0f172a" rx="1.5" transform="rotate(-12 50 73)" />
            {/* Glowing Cyan LED strip */}
            <rect x="30" y="72" width="38" height="2" fill="#38bdf8" rx="1" transform="rotate(-12 50 73)" />
            {/* Scope */}
            <rect x="42" y="66" width="12" height="4" fill="#1e293b" transform="rotate(-12 50 73)" />
            <circle cx="53" cy="67" r="1.5" fill="#38bdf8" />
          </svg>
        </div>
      </div>

      {showLabel && (
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 mt-1">
          COMMANDER SALIH
        </span>
      )}
    </div>
  );
};
