import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface ActivityItem {
  icon: ReactNode
  title: string
  desc?: string
  time?: string
  tone?: "primary" | "success" | "warning" | "danger" | "purple" | "gray"
}

const tones: Record<NonNullable<ActivityItem["tone"]>, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  purple: "bg-purple-50 text-purple-600",
  gray: "bg-gray-100 text-gray-500",
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">Sin actividad reciente</p>
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 py-3.5">
          <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tones[item.tone ?? "gray"])}>
            {item.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800">{item.title}</p>
            {item.desc && <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{item.desc}</p>}
          </div>
          {item.time && <span className="shrink-0 text-xs text-gray-400">{item.time}</span>}
        </li>
      ))}
    </ul>
  )
}
