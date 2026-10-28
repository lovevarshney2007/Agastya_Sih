// Hand-drawn SVG illustrations. Colours follow the theme tokens in index.css.

function Building({ x, y, delay }: { x: number; y: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
    <g className="animate-fade-up" style={{ animationDelay: delay }}>
      <rect x="0" y="0" width="64" height="58" rx="10" fill="#fff" stroke="#d8deea" />
      <path d="M14 24 L32 13 L50 24 Z" fill="#13306b" />
      <rect x="17" y="26" width="5" height="16" rx="1.5" fill="#2457c5" />
      <rect x="29.5" y="26" width="5" height="16" rx="1.5" fill="#2457c5" />
      <rect x="42" y="26" width="5" height="16" rx="1.5" fill="#2457c5" />
      <rect x="13" y="43" width="38" height="4" rx="2" fill="#13306b" />
    </g>
    </g>
  );
}

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 420" className={className} role="img" aria-label="Institutions report students to the ledger, which issues a verified credential">
      <defs>
        <linearGradient id="hi-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#13306b" />
          <stop offset="1" stopColor="#2457c5" />
        </linearGradient>
        <linearGradient id="hi-ledger" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6a24a" />
          <stop offset="1" stopColor="#f08a24" />
        </linearGradient>
        <filter id="hi-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#13306b" floodOpacity=".18" />
        </filter>
      </defs>

      {/* soft background shapes */}
      <circle cx="380" cy="150" r="130" fill="#e9f0fe" />
      <circle cx="130" cy="320" r="90" fill="#fff3e6" />
      <circle cx="460" cy="350" r="40" fill="#e6f6ec" />

      {/* institutions */}
      <Building x={18} y={40} delay=".05s" />
      <Building x={18} y={170} delay=".15s" />
      <Building x={18} y={300} delay=".25s" />

      {/* flows into the ledger */}
      <g fill="none" stroke="#2457c5" strokeWidth="2.5" strokeLinecap="round">
        <path className="draw" d="M86 69 C 140 69, 150 190, 190 200" />
        <path className="draw" d="M86 199 C 130 199, 150 205, 190 208" />
        <path className="draw" d="M86 329 C 140 329, 150 225, 190 216" />
        <path className="draw" d="M262 208 C 290 208, 300 190, 318 182" stroke="#138a4b" />
      </g>

      {/* ledger stack */}
      <g filter="url(#hi-shadow)" className="animate-fade-up" style={{ animationDelay: '.3s' }}>
        <rect x="190" y="226" width="74" height="22" rx="7" fill="#f08a24" opacity=".55" />
        <rect x="190" y="206" width="74" height="22" rx="7" fill="#f08a24" opacity=".8" />
        <rect x="190" y="182" width="74" height="26" rx="7" fill="url(#hi-ledger)" />
        <text x="227" y="200" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Poppins, sans-serif">LEDGER</text>
      </g>

      {/* credential card */}
      <g className="animate-[float_6s_ease-in-out_infinite]" style={{ transformOrigin: '400px 180px' }}>
        <g filter="url(#hi-shadow)">
          <rect x="318" y="72" width="182" height="230" rx="16" fill="#fff" />
          <path d="M318 88 a16 16 0 0 1 16 -16 h150 a16 16 0 0 1 16 16 v34 h-182 Z" fill="url(#hi-card)" />
        </g>
        <circle cx="340" cy="97" r="10" fill="#fff" opacity=".9" />
        <rect x="357" y="90" width="80" height="6" rx="3" fill="#fff" opacity=".9" />
        <rect x="357" y="100" width="54" height="5" rx="2.5" fill="#fff" opacity=".55" />

        <rect x="336" y="140" width="96" height="7" rx="3.5" fill="#d8deea" />
        <rect x="336" y="156" width="130" height="7" rx="3.5" fill="#e8ecf4" />
        <rect x="336" y="172" width="112" height="7" rx="3.5" fill="#e8ecf4" />

        {/* QR */}
        <g transform="translate(336 196)">
          <rect width="72" height="72" rx="8" fill="#f7f9fd" stroke="#d8deea" />
          {[[6, 6], [46, 6], [6, 46]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width="20" height="20" rx="3" fill="#13306b" />
              <rect x={x + 4} y={y + 4} width="12" height="12" rx="2" fill="#f7f9fd" />
              <rect x={x + 7} y={y + 7} width="6" height="6" rx="1" fill="#13306b" />
            </g>
          ))}
          {[[31, 8], [36, 14], [31, 20], [8, 31], [16, 36], [24, 31], [31, 31], [41, 36], [52, 31], [60, 38], [36, 46], [46, 46], [56, 52], [41, 58], [52, 60], [31, 60], [62, 60]].map(([x, y]) => (
            <rect key={`m-${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#13306b" />
          ))}
        </g>

        {/* verified badge */}
        <g transform="translate(456 248)">
          <circle r="26" fill="#138a4b" opacity=".18">
            <animate attributeName="r" values="22;32;22" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".25;0;.25" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="22" fill="#138a4b" />
          <path d="M-9 0 L-3 6 L10 -7" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* shield */}
      <g transform="translate(230 70)">
        <g className="animate-pop" style={{ animationDelay: '.5s' }}>
        <path d="M0 -26 L24 -16 V4 C24 20 12 30 0 36 C-12 30 -24 20 -24 4 V-16 Z" fill="#fff" stroke="#2457c5" strokeWidth="3" />
        <path d="M-9 4 L-2 11 L11 -4" fill="none" stroke="#2457c5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}

export function SignInIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden="true">
      <circle cx="120" cy="100" r="78" fill="#fff" opacity=".06" />
      <circle cx="120" cy="100" r="56" fill="#fff" opacity=".08" />
      <g style={{ transformOrigin: '120px 100px' }} className="animate-[spin_24s_linear_infinite]">
        <circle cx="120" cy="22" r="5" fill="#f08a24" />
        <circle cx="198" cy="100" r="4" fill="#4ade80" />
        <circle cx="42" cy="100" r="4" fill="#93c5fd" />
      </g>
      <g className="animate-[float_6s_ease-in-out_infinite]">
        <path d="M120 58 L150 70 V96 C150 118 136 132 120 140 C104 132 90 118 90 96 V70 Z" fill="#fff" />
        <path d="M120 66 L143 75 V96 C143 113 132 125 120 131 C108 125 97 113 97 96 V75 Z" fill="#2457c5" />
        <rect x="109" y="92" width="22" height="18" rx="3" fill="#fff" />
        <path d="M113 92 V86 a7 7 0 0 1 14 0 V92" fill="none" stroke="#fff" strokeWidth="3" />
        <circle cx="120" cy="100" r="2.6" fill="#2457c5" />
      </g>
    </svg>
  );
}
