

const Button = ({ children, variant = 'primary', fullWidth = false, className = '', ...props }) => {
  const baseStyles =
    'px-8 py-4 rounded-full font-black transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center'

  const variants = {
    primary: 'bg-brand-orange text-white hover:bg-brand-orange/90 hover:shadow-xl hover:shadow-brand-orange/20',
    secondary: 'bg-ui-bg text-ui-text border border-ui-border hover:bg-ui-card hover:shadow-md',
    danger: 'bg-brand-red/10 text-brand-red hover:bg-brand-red/20 border border-brand-red/30',
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

export default Button;
