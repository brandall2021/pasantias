import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

type Tone = "primary" | "success" | "warning" | "danger" | "purple"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: number | string
  hint?: string
  trend?: { value: string; positive: boolean }
  tone?: Tone
}

const tones: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  purple: "bg-purple-50 text-purple-600",
}

export function StatCard({ icon, label, value, hint, trend, tone = "primary" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover animate-slide-up">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tones[tone])}>
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              trend.positive ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"
            )}
          >
            {trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
