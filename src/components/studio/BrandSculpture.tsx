/** Original brand geometry, built from the existing identity palette. */
export default function BrandSculpture() {
  return (
    <div className="brand-sculpture" aria-hidden="true">
      <div className="sculpture-grid" />
      <svg viewBox="0 0 520 520" fill="none" className="sculpture-svg">
        <circle
          cx="260"
          cy="260"
          r="218"
          stroke="currentColor"
          strokeOpacity=".16"
        />
        <circle
          cx="260"
          cy="260"
          r="177"
          stroke="currentColor"
          strokeOpacity=".12"
          strokeDasharray="2 10"
        />
        <path
          d="M42 260H478M260 42V478"
          stroke="currentColor"
          strokeOpacity=".12"
        />
        <g className="sculpture-form" transform="rotate(-24 260 260)">
          <rect
            x="115"
            y="132"
            width="132"
            height="255"
            rx="66"
            stroke="hsl(206 22% 42%)"
            strokeWidth="38"
          />
          <rect
            x="189"
            y="132"
            width="132"
            height="255"
            rx="66"
            stroke="hsl(205 25% 68%)"
            strokeWidth="38"
          />
          <rect
            x="263"
            y="132"
            width="132"
            height="255"
            rx="66"
            stroke="hsl(207 29% 90%)"
            strokeWidth="38"
          />
          <path
            d="M115 197V321C115 357 144 387 181 387"
            stroke="hsl(206 22% 42%)"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d="M189 197V321C189 357 218 387 255 387"
            stroke="hsl(205 25% 68%)"
            strokeWidth="38"
            strokeLinecap="round"
          />
        </g>
        <circle cx="260" cy="42" r="4" fill="currentColor" />
        <circle cx="478" cy="260" r="4" fill="currentColor" />
        <path
          d="M47 48H65M56 39V57M453 463H471M462 454V472"
          stroke="currentColor"
          strokeOpacity=".5"
        />
      </svg>
      <span className="sculpture-caption" dir="ltr">
        BRAND × PRODUCT × SYSTEM
      </span>
      <span className="sculpture-coordinate" dir="ltr">
        MO — 01 / CONNECTED BY DESIGN
      </span>
    </div>
  );
}
