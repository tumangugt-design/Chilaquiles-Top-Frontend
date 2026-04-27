

const Logo = ({ className }) => {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Chilaquiles TOP Logo"
    >
      <defs>
        <path id="textArc" d="M 0,145 Q 200,35 400,145" fill="transparent" />
      </defs>

      {}
      <text width="400">
        <textPath
          href="#textArc"
          startOffset="50%"
          textAnchor="middle"
          fill="#0000FF"
          style={{
            fontSize: '52px',
            fontWeight: 900,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.05em',
          }}
        >
          CHILAQUILES
        </textPath>
      </text>

      {}
      <text
        x="200"
        y="195"
        textAnchor="middle"
        fill="#0000FF"
        style={{
          fontSize: '90px',
          fontWeight: 900,
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.05em',
        }}
      >
        TOP
      </text>

      {}
      <rect x="25" y="165" width="80" height="8" fill="#0000FF" />
      <rect x="295" y="165" width="80" height="8" fill="#0000FF" />
    </svg>
  )
}

export default Logo
