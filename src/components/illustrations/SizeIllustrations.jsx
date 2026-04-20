// ============================================
// ILUSTRACIONES - TAMAÑOS
// Componentes SVG para Media Orden y Orden Completa
// ============================================

const TRAY_RIM = '#374151'
const CHIP_BASE = '#D97706'
const CHIP_LIGHT = '#FBBF24'
const SAUCE_RED = '#DC2626'
const CREAM = '#F9FAFB'
const CHEESE = '#FEF08A'

export const IllustrationMedia = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
    <defs>
      <linearGradient id="trayGradient" x1="120" y1="40" x2="120" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#374151" />
        <stop offset="1" stopColor="#111827" />
      </linearGradient>
    </defs>

    {/* TRAY */}
    <g transform="translate(40, 40) scale(0.7)">
      <ellipse cx="110" cy="110" rx="100" ry="40" fill="#000000" fillOpacity="0.2" />
      <path d="M20 30 C 20 20, 200 20, 200 30 L 190 100 C 190 115, 30 115, 30 100 Z" fill="url(#trayGradient)" />
      <path d="M30 35 C 30 30, 190 30, 190 35 L 180 90 C 180 100, 40 100, 40 90 Z" fill="#0F172A" />
      <path d="M15 30 C 15 15, 205 15, 205 30 L 200 35 C 200 25, 20 25, 20 35 Z" fill={TRAY_RIM} />
    </g>

    {/* FOOD - Media Orden */}
    <g transform="translate(65, 65) scale(0.65)">
      <path d="M10 50 L30 20 L50 50 Z" fill={CHIP_BASE} />
      <path d="M40 55 L70 15 L90 55 Z" fill={CHIP_BASE} />
      <path d="M80 50 L110 25 L130 60 Z" fill={CHIP_BASE} />
      <path d="M120 50 L140 10 L160 50 Z" fill={CHIP_BASE} />

      <path d="M20 40 L40 10 L60 40 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M50 45 L70 5 L90 45 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M90 35 L110 0 L130 40 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M35 30 L55 -5 L75 30 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" strokeLinejoin="round" transform="rotate(10)" />

      <path d="M30 30 Q 40 40 50 30" stroke={SAUCE_RED} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <path d="M100 30 Q 110 40 120 30" stroke={SAUCE_RED} strokeWidth="4" strokeLinecap="round" opacity="0.8" />

      <path d="M25 25 Q 40 40 55 20 T 85 25 T 115 15" stroke={CREAM} strokeWidth="5" strokeLinecap="round" fill="none" />

      <line x1="30" y1="20" x2="35" y2="25" stroke={CHEESE} strokeWidth="2" />
      <line x1="50" y1="15" x2="45" y2="25" stroke={CHEESE} strokeWidth="2" />
      <line x1="90" y1="20" x2="95" y2="10" stroke={CHEESE} strokeWidth="2" />
      <line x1="70" y1="25" x2="80" y2="25" stroke={CHEESE} strokeWidth="2" />
    </g>
  </svg>
)

export const IllustrationCompleta = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
    <defs>
      <linearGradient id="trayGradient2" x1="120" y1="40" x2="120" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#374151" />
        <stop offset="1" stopColor="#111827" />
      </linearGradient>
    </defs>

    {/* TRAY */}
    <g transform="translate(40, 40) scale(0.7)">
      <ellipse cx="110" cy="110" rx="100" ry="40" fill="#000000" fillOpacity="0.2" />
      <path d="M20 30 C 20 20, 200 20, 200 30 L 190 100 C 190 115, 30 115, 30 100 Z" fill="url(#trayGradient2)" />
      <path d="M30 35 C 30 30, 190 30, 190 35 L 180 90 C 180 100, 40 100, 40 90 Z" fill="#0F172A" />
      <path d="M15 30 C 15 15, 205 15, 205 30 L 200 35 C 200 25, 20 25, 20 35 Z" fill={TRAY_RIM} />
    </g>

    {/* FOOD - Orden Completa (more chips, denser) */}
    <g transform="translate(55, 50) scale(0.75)">
      <path d="M0 50 L20 20 L40 50 Z" fill={CHIP_BASE} />
      <path d="M30 60 L60 10 L90 60 Z" fill={CHIP_BASE} />
      <path d="M80 50 L100 20 L120 50 Z" fill={CHIP_BASE} />
      <path d="M120 60 L150 10 L180 60 Z" fill={CHIP_BASE} />
      <path d="M150 40 L170 10 L190 40 Z" fill={CHIP_BASE} />

      <path d="M10 40 L30 5 L50 40 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" />
      <path d="M50 45 L80 -5 L110 45 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" />
      <path d="M100 35 L120 0 L140 35 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" />
      <path d="M140 40 L160 5 L180 40 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" />
      <path d="M40 30 L60 -10 L80 30 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" transform="rotate(-5)" />
      <path d="M70 20 L90 -15 L110 20 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" />
      <path d="M90 25 L110 -10 L130 25 Z" fill={CHIP_LIGHT} stroke={CHIP_BASE} strokeWidth="2" transform="rotate(10)" />

      <path d="M40 20 Q 50 30 60 20" stroke={SAUCE_RED} strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <path d="M120 20 Q 130 30 140 20" stroke={SAUCE_RED} strokeWidth="6" strokeLinecap="round" opacity="0.9" />

      <path d="M20 30 Q 40 50 60 20 T 100 20 T 140 30 T 180 15" stroke={CREAM} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M50 10 Q 70 30 90 0" stroke={CREAM} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />

      <g stroke={CHEESE} strokeWidth="2.5" strokeLinecap="round">
        <line x1="40" y1="10" x2="45" y2="15" />
        <line x1="60" y1="5" x2="55" y2="15" />
        <line x1="80" y1="0" x2="85" y2="10" />
        <line x1="100" y1="-5" x2="95" y2="5" />
        <line x1="120" y1="0" x2="125" y2="10" />
        <line x1="140" y1="5" x2="135" y2="15" />
        <line x1="70" y1="15" x2="80" y2="15" />
        <line x1="110" y1="15" x2="100" y2="20" />
        <line x1="130" y1="10" x2="140" y2="5" />
      </g>
    </g>
  </svg>
)
