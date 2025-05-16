import { FC, ReactNode } from 'react'

interface SectionHeaderProps {
  title?: string
  icon?: ReactNode
  description?: string
  action?: ReactNode
  className?: string
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  icon,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && (
          <div className="text-blue-600">
            {icon}
          </div>
        )}
        <div>
          {title && (
            <h2 className="text-2xl font-bold">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600 text-sm mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}
