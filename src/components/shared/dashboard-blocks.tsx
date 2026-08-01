import { Badge } from "@/components/ui/badge"

export function StepItem({ done, label, href }: { done: boolean; label: string; href: string }) {
  return (
    <li>
      <a href={href} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition-all hover:border-primary-300 hover:shadow-card">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"}`}>
          {done ? "✓" : "•"}
        </span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </a>
    </li>
  )
}

export function QuickLink({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <a href={href} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 transition-all hover:border-primary-300 hover:shadow-card">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Badge variant="secondary">{value}</Badge>
    </a>
  )
}
