const baseProps = (size, color) => ({
  width: size,
  height: size,
  viewBox: '0 0 80 100',
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  xmlns: 'http://www.w3.org/2000/svg',
});

export const DoubleHungIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <rect x="10" y="10" width="60" height="80" rx="2" />
    <line x1="10" y1="50" x2="70" y2="50" />
    <rect x="14" y="14" width="52" height="32" rx="1" strokeWidth="1.4" />
    <rect x="14" y="54" width="52" height="32" rx="1" strokeWidth="1.4" />
  </svg>
);

export const PictureIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <rect x="5" y="10" width="70" height="80" rx="2" />
    <rect x="14" y="19" width="52" height="62" rx="1" strokeWidth="1.4" />
  </svg>
);

export const SlidingIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <rect x="5" y="20" width="70" height="60" rx="2" />
    <line x1="40" y1="20" x2="40" y2="80" />
    <rect x="9" y="24" width="29" height="52" rx="1" strokeWidth="1.4" />
    <rect x="42" y="24" width="29" height="52" rx="1" strokeWidth="1.4" />
    <path d="M 28 92 L 52 92" strokeWidth="1.2" />
    <path d="M 28 92 L 32 89" strokeWidth="1.2" />
    <path d="M 28 92 L 32 95" strokeWidth="1.2" />
    <path d="M 52 92 L 48 89" strokeWidth="1.2" />
    <path d="M 52 92 L 48 95" strokeWidth="1.2" />
  </svg>
);

export const BayBowIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 90 120"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="10" y1="15" x2="30" y2="35" />
    <line x1="30" y1="35" x2="60" y2="35" />
    <line x1="60" y1="35" x2="80" y2="15" />
    <line x1="10" y1="15" x2="10" y2="85" />
    <line x1="80" y1="15" x2="80" y2="85" />
    <line x1="10" y1="85" x2="30" y2="105" />
    <line x1="30" y1="105" x2="60" y2="105" />
    <line x1="60" y1="105" x2="80" y2="85" />
    <line x1="30" y1="35" x2="30" y2="105" />
    <line x1="60" y1="35" x2="60" y2="105" />
    <polygon points="14,21 27,34 27,100 14,79" strokeWidth="1.4" />
    <rect x="34" y="39" width="22" height="62" rx="1" strokeWidth="1.4" />
    <polygon points="76,21 63,34 63,100 76,79" strokeWidth="1.4" />
  </svg>
);

export const SlidingPatioDoorIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <rect x="5" y="5" width="70" height="85" rx="2" />
    <line x1="40" y1="5" x2="40" y2="90" />
    <rect x="11" y="11" width="25" height="73" rx="1" strokeWidth="1.4" />
    <rect x="44" y="11" width="25" height="73" rx="1" strokeWidth="1.4" />
    <circle cx="36" cy="50" r="1.5" fill={color} />
    <circle cx="44" cy="50" r="1.5" fill={color} />
    <path d="M 22 96 L 58 96" strokeWidth="1.2" />
    <path d="M 22 96 L 26 93" strokeWidth="1.2" />
    <path d="M 22 96 L 26 99" strokeWidth="1.2" />
    <path d="M 58 96 L 54 93" strokeWidth="1.2" />
    <path d="M 58 96 L 54 99" strokeWidth="1.2" />
  </svg>
);

export const OtherWindowIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <rect x="10" y="10" width="60" height="80" rx="2" />
    <line x1="10" y1="50" x2="70" y2="50" strokeWidth="1.3" />
    <line x1="40" y1="10" x2="40" y2="90" strokeWidth="1.3" />
    <circle cx="40" cy="50" r="9" strokeWidth="1.4" />
    <line x1="40" y1="46" x2="40" y2="54" strokeWidth="1.4" />
    <line x1="36" y1="50" x2="44" y2="50" strokeWidth="1.4" />
  </svg>
);

