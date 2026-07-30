"use client"

import { Star } from "lucide-react"

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 20,
  disabled = false,
}: {
  value: number
  onChange?: (v: number) => void
  max?: number
  size?: number
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(i + 1)}
          className={`${disabled ? "" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <Star
            size={size}
            className={i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  )
}
