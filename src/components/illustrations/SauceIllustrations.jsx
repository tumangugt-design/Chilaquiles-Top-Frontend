// ============================================
// ILUSTRACIONES - SALSAS
// Componentes SVG para las opciones de salsa
// ============================================

const KRAFT_INNER = '#C4A35A'
const KRAFT_HIGHLIGHT = '#E8C97A'
const KRAFT_SHADOW = '#8B7040'

const SAUCE_RED_BASE = '#DC2626'
const SAUCE_RED_LIGHT = '#FCA5A5'
const SAUCE_GREEN_BASE = '#16A34A'
const SAUCE_GREEN_LIGHT = '#86EFAC'

const KraftCup = ({ x, y, scale = 1, sauceType }) => {
  const sauceBase = sauceType === 'RED' ? SAUCE_RED_BASE : SAUCE_GREEN_BASE
  const sauceLight = sauceType === 'RED' ? SAUCE_RED_LIGHT : SAUCE_GREEN_LIGHT
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Shadow */}
      <ellipse cx="0" cy="45" rx="42" ry="10" fill="#000" fillOpacity="0.15" />

      {/* Cup Body */}
      <path
        d="M-35 -30 L-38 35 Q-38 45 0 45 Q38 45 38 35 L35 -30 Z"
        fill="#E8D5A3"
        stroke={KRAFT_SHADOW}
        strokeWidth="1"
      />

      {/* Kraft Paper Lines */}
      <line x1="-33" y1="-15" x2="-36" y2="25" stroke={KRAFT_SHADOW} strokeWidth="0.5" strokeOpacity="0.3" />
      <line x1="33" y1="-15" x2="36" y2="25" stroke={KRAFT_SHADOW} strokeWidth="0.5" strokeOpacity="0.3" />
      <line x1="-18" y1="-28" x2="-20" y2="38" stroke={KRAFT_SHADOW} strokeWidth="0.5" strokeOpacity="0.2" />
      <line x1="18" y1="-28" x2="20" y2="38" stroke={KRAFT_SHADOW} strokeWidth="0.5" strokeOpacity="0.2" />

      {/* Top Rim (Ellipse) */}
      <ellipse cx="0" cy="-30" rx="35" ry="10" fill={KRAFT_HIGHLIGHT} stroke={KRAFT_SHADOW} strokeWidth="1" />
      <ellipse cx="0" cy="-30" rx="30" ry="8" fill={KRAFT_INNER} />

      {/* Sauce Fill */}
      <ellipse cx="0" cy="-26" rx="26" ry="7" fill={sauceBase} />
      <ellipse cx="0" cy="-26" rx="18" ry="4" fill={sauceLight} fillOpacity="0.8" />
      <path d="M -14 -28 Q 0 -32 14 -28" stroke="white" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" fill="none" />

      {/* Front Rim */}
      <path d="M-35 -30 A 35 10 0 0 0 35 -30" stroke={KRAFT_HIGHLIGHT} strokeWidth="3" fill="none" />
      <path d="M-35 -30 A 35 10 0 0 0 35 -30" stroke={KRAFT_SHADOW} strokeWidth="1" fill="none" opacity="0.5" />
    </g>
  )
}

export const IllustrationRoja = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
    <KraftCup x={120} y={95} scale={1.2} sauceType="RED" />
  </svg>
)

export const IllustrationVerde = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
    <KraftCup x={120} y={95} scale={1.2} sauceType="GREEN" />
  </svg>
)

export const IllustrationDivorciados = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
    {/* Back Cup (Red) */}
    <KraftCup x={90} y={85} scale={1} sauceType="RED" />
    {/* Front Cup (Green) */}
    <KraftCup x={150} y={105} scale={1} sauceType="GREEN" />
  </svg>
)
