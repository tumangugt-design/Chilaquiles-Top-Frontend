

const BOWL_HIGHLIGHT = '#FFFFFF'
const BOWL_RIM = '#374151'

const STEAK_BASE = '#991B1B'
const STEAK_GRILL = '#450A0A'
const CHICKEN_BASE = '#FEF3C7'
const CHICKEN_SHADOW = '#D97706'
const CHORIZO_BASE = '#DC2626'
const CHORIZO_FAT = '#FECACA'
const AVO_LIGHT = '#D9F99D'
const AVO_DARK = '#65A30D'
const ONION_CARAMEL_BASE = '#B45309'
const ONION_CARAMEL_LIGHT = '#FBBF24'
const CHEESE_BASE = '#FEFCE8'
const CHEESE_SHADOW = '#FDE047'
const ONION_WHITE = '#FFFFFF'
const CILANTRO_BASE = '#4ADE80'
const CREAM_BASE = '#FFFFFF'
const CREAM_SHADOW = '#DBEAFE'

const BlackPorcelainBowl = ({ children }) => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="blackBodyGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#111827" />
        <stop offset="0.3" stopColor="#374151" />
        <stop offset="1" stopColor="#1F2937" />
      </linearGradient>
      <linearGradient id="blackInnerGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000000" stopOpacity="0.8" />
        <stop offset="1" stopColor="#1F2937" />
      </linearGradient>
    </defs>
    <g transform="translate(25, 35)">
      <ellipse cx="75" cy="100" rx="65" ry="12" fill="#000000" fillOpacity="0.3" />
      <path d="M10 30 L10 70 Q10 95 35 100 L115 100 Q140 95 140 70 L140 30" fill="url(#blackBodyGrad)" />
      <path d="M10 30 L35 15 L115 15 L140 30 L115 45 L35 45 L10 30 Z" fill={BOWL_RIM} />
      <path d="M15 30 L37 19 L113 19 L135 30 L113 41 L37 41 L15 30 Z" fill="url(#blackInnerGrad)" />
      <g transform="translate(0, -5)">{children}</g>
      <path d="M10 30 L35 45 L115 45 L140 30" stroke={BOWL_HIGHLIGHT} strokeWidth="1" strokeOpacity="0.3" fill="none" />
      <path d="M35 45 L115 45" stroke={BOWL_HIGHLIGHT} strokeWidth="2" strokeOpacity="0.1" fill="none" strokeLinecap="round" />
      <path d="M12 32 L12 80" stroke={BOWL_HIGHLIGHT} strokeWidth="2" strokeOpacity="0.1" fill="none" strokeLinecap="round" />
      <path d="M35 15 L115 15" stroke={BOWL_HIGHLIGHT} strokeWidth="1" strokeOpacity="0.4" fill="none" />
    </g>
  </svg>
)

export const IllustrationSteak = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 10)">
      <path d="M10 20 L40 10 L60 30 L30 40 Z" fill={STEAK_BASE} stroke={STEAK_GRILL} strokeWidth="1" />
      <path d="M35 25 L65 15 L85 35 L55 45 Z" fill={STEAK_BASE} stroke={STEAK_GRILL} strokeWidth="1" />
      <path d="M60 20 L90 10 L110 30 L80 40 Z" fill={STEAK_BASE} stroke={STEAK_GRILL} strokeWidth="1" />
      <path d="M20 25 L30 30" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M45 25 L55 30" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M70 20 L80 25" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationPollo = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 10)">
      <path d="M20 30 Q50 5 80 30 T 110 30 L100 45 L30 45 Z" fill={CHICKEN_BASE} />
      <path d="M30 35 L40 25" stroke={CHICKEN_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 30 L60 20" stroke={CHICKEN_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <path d="M70 32 L80 22" stroke={CHICKEN_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <path d="M90 35 L100 25" stroke={CHICKEN_SHADOW} strokeWidth="2" strokeLinecap="round" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationChorizo = () => (
  <BlackPorcelainBowl>
    <g transform="translate(30, 15)">
      <circle cx="20" cy="20" r="8" fill={CHORIZO_BASE} />
      <circle cx="40" cy="15" r="9" fill={CHORIZO_BASE} />
      <circle cx="60" cy="22" r="8" fill={CHORIZO_BASE} />
      <circle cx="80" cy="18" r="9" fill={CHORIZO_BASE} />
      <circle cx="50" cy="30" r="8" fill={CHORIZO_BASE} />
      <circle cx="30" cy="28" r="7" fill={CHORIZO_BASE} />
      <circle cx="38" cy="15" r="2" fill={CHORIZO_FAT} />
      <circle cx="62" cy="20" r="2" fill={CHORIZO_FAT} />
      <circle cx="82" cy="16" r="2" fill={CHORIZO_FAT} />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationAguacate = () => (
  <BlackPorcelainBowl>
    <g transform="translate(30, 10)">
      <path d="M10 20 L30 15 L40 25 L20 30 Z" fill={AVO_LIGHT} stroke={AVO_DARK} strokeWidth="1" />
      <path d="M20 30 L40 25 L40 35 L20 40 Z" fill={AVO_DARK} />
      <path d="M45 15 L65 10 L75 20 L55 25 Z" fill={AVO_LIGHT} stroke={AVO_DARK} strokeWidth="1" />
      <path d="M55 25 L75 20 L75 30 L55 35 Z" fill={AVO_DARK} />
      <path d="M30 30 L50 25 L60 35 L40 40 Z" fill={AVO_LIGHT} stroke={AVO_DARK} strokeWidth="1" />
      <path d="M70 25 L90 20 L100 30 L80 35 Z" fill={AVO_LIGHT} stroke={AVO_DARK} strokeWidth="1" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationCebollaCaramel = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 15)">
      <path d="M10 20 Q30 5 50 25 T90 20" stroke={ONION_CARAMEL_BASE} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M20 30 Q40 15 60 35 T100 30" stroke={ONION_CARAMEL_LIGHT} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M15 25 Q35 10 55 30 T95 25" stroke={ONION_CARAMEL_BASE} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationQuesoExtra = () => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    {/* Shadow */}
    <ellipse cx="100" cy="120" rx="70" ry="12" fill="#000000" fillOpacity="0.15" />
    
    {/* Cheese Wedge */}
    {/* Top Face */}
    <path d="M 40 90 L 125 50 L 150 85 C 120 110 75 110 40 90 Z" fill="#FEF08A" stroke="#FDE047" strokeWidth="1" />
    {/* Front Left Face */}
    <path d="M 40 90 L 125 50 L 125 95 L 40 125 Z" fill="#FDE047" stroke="#FBBF24" strokeWidth="1" />
    {/* Front Right Face */}
    <path d="M 125 50 L 150 85 L 150 120 L 125 95 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
    
    {/* Holes on Top Face */}
    <ellipse cx="75" cy="78" rx="8" ry="4" fill="#EAB308" opacity="0.3" />
    <ellipse cx="110" cy="72" rx="6" ry="3" fill="#EAB308" opacity="0.3" />
    
    {/* Holes on Front Left Face */}
    <ellipse cx="65" cy="105" rx="7" ry="11" fill="#CA8A04" opacity="0.3" />
    <ellipse cx="100" cy="80" rx="5" ry="8" fill="#CA8A04" opacity="0.3" />
    
    {/* Holes on Front Right Face */}
    <ellipse cx="138" cy="98" rx="4" ry="6" fill="#A16207" opacity="0.3" />

    {/* Extra Cheese Block/Cube 1 next to it */}
    <g transform="translate(115, 105)">
      {/* Shadow */}
      <ellipse cx="20" cy="20" rx="12" ry="4" fill="#000000" fillOpacity="0.1" />
      {/* Top */}
      <path d="M 10 5 L 25 0 L 35 7 L 20 12 Z" fill="#FEF08A" />
      {/* Left */}
      <path d="M 10 5 L 20 12 L 20 22 L 10 15 Z" fill="#FDE047" />
      {/* Right */}
      <path d="M 20 12 L 35 7 L 35 17 L 20 22 Z" fill="#EAB308" />
    </g>
    
    {/* Extra Cheese Block/Cube 2 */}
    <g transform="translate(25, 110)">
      {/* Shadow */}
      <ellipse cx="15" cy="15" rx="10" ry="3" fill="#000000" fillOpacity="0.1" />
      {/* Top */}
      <path d="M 5 3 L 15 0 L 22 5 L 12 8 Z" fill="#FEF08A" />
      {/* Left */}
      <path d="M 5 3 L 12 8 L 12 15 L 5 10 Z" fill="#FDE047" />
      {/* Right */}
      <path d="M 12 8 L 22 5 L 22 12 L 12 15 Z" fill="#EAB308" />
    </g>
  </svg>
)

export const IllustrationQueso = () => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    {/* Shadow */}
    <ellipse cx="100" cy="120" rx="60" ry="12" fill="#000000" fillOpacity="0.15" />
    
    {/* Cheese Wedge */}
    {/* Top Face */}
    <path d="M 45 90 L 135 50 L 160 85 C 130 110 80 110 45 90 Z" fill="#FEF08A" stroke="#FDE047" strokeWidth="1" />
    {/* Front Left Face */}
    <path d="M 45 90 L 130 50 L 130 95 L 45 125 Z" fill="#FDE047" stroke="#FBBF24" strokeWidth="1" />
    {/* Front Right Face */}
    <path d="M 130 50 L 160 85 L 160 120 L 130 95 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
    
    {/* Cheese holes on Top Face */}
    <ellipse cx="85" cy="78" rx="8" ry="4" fill="#EAB308" opacity="0.3" />
    <ellipse cx="120" cy="72" rx="6" ry="3" fill="#EAB308" opacity="0.3" />
    <ellipse cx="140" cy="85" rx="5" ry="2.5" fill="#EAB308" opacity="0.3" />
    
    {/* Cheese holes on Front Left Face */}
    <ellipse cx="75" cy="105" rx="7" ry="11" fill="#CA8A04" opacity="0.3" />
    <ellipse cx="110" cy="80" rx="5" ry="8" fill="#CA8A04" opacity="0.3" />
    <ellipse cx="55" cy="115" rx="4" ry="6" fill="#CA8A04" opacity="0.3" />
    
    {/* Cheese holes on Front Right Face */}
    <ellipse cx="145" cy="98" rx="5" ry="8" fill="#A16207" opacity="0.3" />
  </svg>
)

export const IllustrationTotopos = () => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    {/* Shadow */}
    <ellipse cx="100" cy="115" rx="65" ry="12" fill="#000000" fillOpacity="0.2" />
    
    {/* Tortilla Chips / Nachos */}
    {/* Background layer chips */}
    <path d="M 50 110 L 95 45 L 125 105 Z" fill="#D97706" opacity="0.9" />
    <path d="M 90 105 L 135 40 L 165 115 Z" fill="#B45309" opacity="0.9" />
    
    {/* Mid layer chips */}
    <path d="M 65 115 L 110 50 L 145 115 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M 110 110 L 140 60 L 168 110 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M 35 115 L 70 65 L 98 115 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
    
    {/* Foreground chips */}
    <path d="M 50 120 L 85 75 L 115 120 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M 90 125 L 125 70 L 155 125 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M 72 128 L 105 85 L 132 128 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />

    {/* Details (salt specks / toasted bubbles) */}
    <circle cx="85" cy="100" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    <circle cx="95" cy="110" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    <circle cx="110" cy="95" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    <circle cx="120" cy="115" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    <circle cx="130" cy="105" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    
    <circle cx="68" cy="108" r="1" fill="#B45309" />
    <circle cx="102" cy="78" r="1.5" fill="#B45309" />
    <circle cx="125" cy="85" r="1.2" fill="#B45309" />
    <circle cx="140" cy="118" r="1.5" fill="#B45309" />
  </svg>
)


export const IllustrationCebolla = () => (
  <BlackPorcelainBowl>
    <g transform="translate(30, 15)">
      <rect x="10" y="10" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="22" y="12" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="35" y="8" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="15" y="22" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="48" y="15" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="60" y="20" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="30" y="25" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationCilantro = () => (
  <BlackPorcelainBowl>
    <g transform="translate(30, 15)">
      <path d="M10 20 L15 10 L25 15 Z" fill={CILANTRO_BASE} />
      <path d="M30 15 L40 5 L45 20 Z" fill={CILANTRO_BASE} />
      <path d="M50 25 L60 15 L70 30 Z" fill={CILANTRO_BASE} />
      <path d="M20 30 L25 25 L35 35 Z" fill={CILANTRO_BASE} />
      <path d="M70 20 L80 10 L85 25 Z" fill={CILANTRO_BASE} />
      <path d="M40 35 L50 25 L55 40 Z" fill={CILANTRO_BASE} />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationCrema = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 15)">
      <path d="M10 25 Q30 15 60 25 T110 25 Q110 40 60 45 Q10 40 10 25 Z" fill={CREAM_BASE} />
      <path d="M30 25 Q40 20 50 25" stroke={CREAM_SHADOW} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="30" r="3" fill={CREAM_SHADOW} />
    </g>
  </BlackPorcelainBowl>
)
