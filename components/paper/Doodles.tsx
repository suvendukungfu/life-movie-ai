import React from "react";

export function HandDrawnStar({
  className = "w-6 h-6 text-[#201D1C]",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M24 4 L28.8 17.2 L43 18.1 L32 27.5 L35.5 41.5 L24 33.8 L12.5 41.5 L16 27.5 L5 18.1 L19.2 17.2 Z" />
    </svg>
  );
}

export function HandDrawnSun({
  className = "w-24 h-24 text-[#201D1C]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Sun face circle */}
      <circle cx="50" cy="50" r="24" strokeWidth="3" />
      {/* Eyes & Smile */}
      <path d="M42 45 Q44 48 46 45" strokeWidth="2.5" />
      <path d="M54 45 Q56 48 58 45" strokeWidth="2.5" />
      <path d="M44 56 Q50 63 56 56" strokeWidth="2.5" />
      {/* Rays */}
      <path d="M50 14 L50 20" />
      <path d="M50 80 L50 86" />
      <path d="M14 50 L20 50" />
      <path d="M80 50 L86 50" />
      <path d="M24 24 L29 29" />
      <path d="M71 71 L76 76" />
      <path d="M24 76 L29 71" />
      <path d="M71 29 L76 24" />
      <path d="M37 18 L39 23" />
      <path d="M63 18 L61 23" />
      <path d="M82 37 L77 39" />
      <path d="M82 63 L77 61" />
    </svg>
  );
}

export function HandDrawnCurlyArrow({
  className = "w-32 h-20 text-[#D9822B]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 180 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeDasharray="6 4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 20 Q50 10 90 25 T130 50 Q150 70 160 40 Q165 25 150 20 Q135 15 145 35 T170 30" />
      <path
        d="M165 22 L172 32 L160 36"
        strokeDasharray="none"
        strokeWidth="2.8"
      />
    </svg>
  );
}

export function HandDrawnPaperPlane({
  className = "w-12 h-12 text-[#201D1C]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 30 L52 10 L34 50 L26 34 Z" />
      <path d="M26 34 L52 10" />
      <path d="M26 34 L26 44 L31 38" />
    </svg>
  );
}

export function HandDrawnBasketball({
  className = "w-16 h-16 text-[#201D1C]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="32" cy="32" r="22" />
      <path d="M10 32 L54 32" />
      <path d="M32 10 L32 54" />
      <path d="M18 16 Q32 26 46 16" />
      <path d="M18 48 Q32 38 46 48" />
      {/* Motion lines */}
      <path d="M5 24 Q0 28 2 32" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M5 38 Q0 34 2 30" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}

export function HandDrawnCamera({
  className = "w-16 h-16 text-[#201D1C]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="8" y="18" width="48" height="34" rx="4" />
      <circle cx="32" cy="35" r="11" />
      <circle cx="32" cy="35" r="6" strokeDasharray="2 2" />
      <path d="M20 18 L24 12 L40 12 L44 18" />
      <circle cx="46" cy="25" r="2" fill="currentColor" />
    </svg>
  );
}

export function HandDrawnClapperboard({
  className = "w-14 h-14 text-[#201D1C]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="6" y="24" width="48" height="28" rx="2" />
      <path d="M6 24 L54 14" />
      <path d="M14 22 L20 14" />
      <path d="M26 20 L32 12" />
      <path d="M38 18 L44 10" />
      <path d="M12 36 L48 36" strokeDasharray="4 3" strokeWidth="1.8" />
      <path d="M12 44 L36 44" strokeWidth="1.8" />
    </svg>
  );
}

export function HandDrawnHeart({
  className = "w-8 h-8 text-[#D45D55]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 34 Q10 24 5 16 A9 9 0 0 1 20 11 A9 9 0 0 1 35 16 Q30 24 20 34 Z" />
    </svg>
  );
}

export function ScribbleUnderline({
  className = "w-48 h-6 text-[#C85A28]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      className={className}
    >
      <path d="M4 14 Q50 6 100 16 T196 10" />
      <path d="M20 18 Q70 12 120 19 T180 15" strokeWidth="2.2" opacity="0.7" />
    </svg>
  );
}
