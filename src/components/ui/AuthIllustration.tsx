export default function AuthIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dashboard card */}
      <rect x="60" y="80" width="280" height="180" rx="16" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.1" strokeWidth="1" />

      {/* Mini bar chart inside card */}
      <rect x="90" y="190" width="24" height="50" rx="4" fill="white" fillOpacity="0.15" />
      <rect x="124" y="160" width="24" height="80" rx="4" fill="white" fillOpacity="0.2" />
      <rect x="158" y="175" width="24" height="65" rx="4" fill="white" fillOpacity="0.12" />
      <rect x="192" y="140" width="24" height="100" rx="4" fill="white" fillOpacity="0.25" />
      <rect x="226" y="155" width="24" height="85" rx="4" fill="white" fillOpacity="0.18" />
      <rect x="260" y="130" width="24" height="110" rx="4" fill="white" fillOpacity="0.22" />

      {/* Card title lines */}
      <rect x="90" y="105" width="120" height="8" rx="4" fill="white" fillOpacity="0.2" />
      <rect x="90" y="120" width="80" height="6" rx="3" fill="white" fillOpacity="0.1" />

      {/* Trend arrow */}
      <path d="M280 105 L305 95 L300 105 L310 100" stroke="white" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Large coin */}
      <circle cx="400" cy="140" r="55" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
      <circle cx="400" cy="140" r="40" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.08" strokeWidth="1" />
      {/* Dirham symbol on coin */}
      <path d="M408 125C408 125 414 128 414 133C414 138 408 140 404 140C400 140 394 138 394 133" stroke="white" strokeOpacity="0.2" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M404 140V148" stroke="white" strokeOpacity="0.2" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M399 146H409" stroke="white" strokeOpacity="0.2" strokeWidth="2.5" strokeLinecap="round" />

      {/* Small floating coins */}
      <circle cx="350" cy="60" r="18" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
      <circle cx="440" cy="230" r="14" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.08" strokeWidth="1" />

      {/* Wallet card */}
      <rect x="280" y="270" width="180" height="120" rx="14" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
      <rect x="300" y="295" width="100" height="8" rx="4" fill="white" fillOpacity="0.15" />
      <rect x="300" y="310" width="60" height="6" rx="3" fill="white" fillOpacity="0.08" />
      {/* Chip */}
      <rect x="300" y="340" width="30" height="22" rx="4" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
      <line x1="300" y1="348" x2="330" y2="348" stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
      <line x1="315" y1="340" x2="315" y2="362" stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
      {/* Card number dots */}
      <circle cx="350" cy="351" r="2" fill="white" fillOpacity="0.12" />
      <circle cx="358" cy="351" r="2" fill="white" fillOpacity="0.12" />
      <circle cx="366" cy="351" r="2" fill="white" fillOpacity="0.12" />
      <circle cx="374" cy="351" r="2" fill="white" fillOpacity="0.12" />

      {/* Pie chart */}
      <circle cx="130" cy="360" r="50" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
      <path d="M130 310 A50 50 0 0 1 175 345 L130 360 Z" fill="white" fillOpacity="0.12" />
      <path d="M175 345 A50 50 0 0 1 145 408 L130 360 Z" fill="white" fillOpacity="0.08" />
      <path d="M145 408 A50 50 0 0 1 80 360 L130 360 Z" fill="white" fillOpacity="0.05" />
      <circle cx="130" cy="360" r="25" fill="white" fillOpacity="0.03" />

      {/* Growth line */}
      <path
        d="M60 440 Q120 420 180 430 Q240 440 300 400 Q360 360 420 380 Q450 390 470 370"
        stroke="white"
        strokeOpacity="0.1"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M60 440 Q120 420 180 430 Q240 440 300 400 Q360 360 420 380 Q450 390 470 370 L470 500 L60 500 Z"
        fill="white"
        fillOpacity="0.03"
      />

      {/* Sparkle dots */}
      <circle cx="470" cy="370" r="4" fill="white" fillOpacity="0.2" />
      <circle cx="300" cy="400" r="3" fill="white" fillOpacity="0.15" />
      <circle cx="180" cy="430" r="2.5" fill="white" fillOpacity="0.12" />

      {/* Floating plus icons (savings) */}
      <g opacity="0.12">
        <circle cx="60" cy="50" r="12" stroke="white" strokeWidth="1" fill="none" />
        <line x1="55" y1="50" x2="65" y2="50" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="60" y1="45" x2="60" y2="55" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      <g opacity="0.08">
        <circle cx="480" cy="80" r="10" stroke="white" strokeWidth="1" fill="none" />
        <line x1="476" y1="80" x2="484" y2="80" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="480" y1="76" x2="480" y2="84" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Target/goal ring */}
      <circle cx="240" cy="440" r="20" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" />
      <circle cx="240" cy="440" r="12" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
      <circle cx="240" cy="440" r="4" fill="white" fillOpacity="0.1" />
    </svg>
  );
}
