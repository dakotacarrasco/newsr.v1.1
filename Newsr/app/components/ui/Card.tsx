import { FC, ReactNode } from 'react'

interface CardProps {
  children?: ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  accent?: 'blue' | 'red' | 'green' | 'purple'
}

export const Card: FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  accent
}) => {
  const baseStyles = 'bg-white relative'
  const variantStyles = {
    default: 'border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    outline: 'border-2 border-black',
    ghost: ''
  }
  
  const accentStyles = accent ? {
    blue: 'before:absolute before:-top-2 before:-right-2 before:h-5 before:w-5 before:border-2 before:border-black before:bg-blue-500',
    red: 'before:absolute before:-top-2 before:-right-2 before:h-5 before:w-5 before:border-2 before:border-black before:bg-red-500',
    green: 'before:absolute before:-top-2 before:-right-2 before:h-5 before:w-5 before:border-2 before:border-black before:bg-green-500',
    purple: 'before:absolute before:-top-2 before:-right-2 before:h-5 before:w-5 before:border-2 before:border-black before:bg-purple-500'
  }[accent] : ''

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${accentStyles} ${className}`}>
      {children}
    </div>
  )
}
