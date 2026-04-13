export default function Logo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coin base */}
      <circle cx="16" cy="16" r="14" fill="currentColor" fillOpacity="0.15" />
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />

      {/* Inner ring */}
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.2" />

      {/* Dirham symbol - stylized "د" */}
      <path
        d="M18.5 10C18.5 10 21 11.5 21 14.5C21 17.5 18.5 19 16 19C13.5 19 11 17.5 11 14.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M16 19V23"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M13 21.5H19"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Sparkle accents */}
      <circle cx="8" cy="10" r="1" fill="currentColor" fillOpacity="0.5" />
      <circle cx="24" cy="22" r="0.8" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}
