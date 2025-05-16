import * as React from "react"
import { cn } from "@/app/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    
    const variants = {
      default: "bg-white text-black border-2 border-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      destructive: "bg-red-500 text-white border-2 border-black hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      outline: "border-2 border-black bg-transparent hover:bg-gray-50",
      secondary: "bg-gray-100 text-black border-2 border-black hover:bg-gray-200",
      ghost: "hover:bg-gray-100 hover:text-black",
      link: "text-blue-600 underline-offset-4 hover:underline"
    }
    
    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10"
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
