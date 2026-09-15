"use client";

export function ShieldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 40" className={className} aria-hidden>
      <path
        d="M18 2.2 33 8.4v11.2c0 8.6-6.2 15.4-15 17.8C9.2 35 3 28.2 3 19.6V8.4L18 2.2Z"
        fill="currentColor"
        className="text-fortress-gold"
      />
      <path
        d="M18 6.1 29.2 10.6v8.7c0 6.4-4.6 11.5-11.2 13.3C11.4 30.8 6.8 25.7 6.8 19.3v-8.7L18 6.1Z"
        fill="#12161e"
      />
      <path
        d="M18 11.2v14.6M12.4 16.4h11.2"
        stroke="#c9a227"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}
