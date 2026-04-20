// ============================================
// COMPONENTE: Button
// ============================================

const Button = ({ children, variant = 'primary', fullWidth = false, className = '', ...props }) => {
  const baseStyles =
    'px-8 py-4 rounded-full font-bold transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm tracking-wide flex items-center justify-center'

  const variants = {
    primary: 'bg-brand-orange text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-red-50 text-brand-red hover:bg-red-100 border border-brand-red',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
