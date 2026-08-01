import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "secondary"
  dot?: boolean
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", dot = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-primary-50 text-primary-700",
      success: "bg-success-50 text-success-700",
      warning: "bg-warning-50 text-warning-700",
      destructive: "bg-danger-50 text-danger-700",
      secondary: "bg-gray-100 text-gray-700",
    }
    const dots = {
      default: "bg-primary-500",
      success: "bg-success-500",
      warning: "bg-warning-500",
      destructive: "bg-danger-500",
      secondary: "bg-gray-400",
    }
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
          variants[variant],
          className
        )}
        {...props}
      >
        {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[variant])} />}
        {children}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
