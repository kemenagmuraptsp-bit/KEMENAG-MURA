export function KemenagEmblem({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <polygon
        points="32,3 59,18.5 59,45.5 32,61 5,45.5 5,18.5"
        fill="#064E3B"
        stroke="#D97706"
        strokeWidth="2.5"
      />
      <polygon
        points="32,8 54,21 54,43 32,56 10,43 10,21"
        fill="none"
        stroke="#34D399"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      {/* Open Book & Star Institutional Motif */}
      <path
        d="M19 41C23 39 27.5 39 32 41.5C36.5 39 41 39 45 41V27C41 25 36.5 25 32 27.5C27.5 25 23 25 19 27V41Z"
        fill="#ECFDF5"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M32 27.5V41.5" stroke="#064E3B" strokeWidth="1.4" />
      <polygon
        points="32,13 34.1,18.2 39.6,18.6 35.4,22.1 36.7,27.5 32,24.5 27.3,27.5 28.6,22.1 24.4,18.6 29.9,18.2"
        fill="#FBBF24"
      />
    </svg>
  );
}
