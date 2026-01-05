import * as React from "react"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimeInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  icon?: React.ReactNode
  label?: string
}

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, icon, label, disabled, ...props }, ref) => {
    return (
      <div className="space-y-3">
        {label && (
          <span className="block text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        )}
        <div
          className={cn(
            "group relative flex items-center gap-4 rounded-base border-base border-bw bg-blank p-4 shadow-shadow transition-all duration-100",
            !disabled && "hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {/* Icon Container */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-base border-base border-bw bg-main shadow-shadow transition-all duration-100 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">
            {icon || <Clock className="h-7 w-7 text-main-foreground" strokeWidth={2.5} />}
          </div>

          {/* Time Display */}
          <input
            type="time"
            ref={ref}
            disabled={disabled}
            className={cn(
              "flex-1 bg-transparent text-4xl font-bold tracking-tight outline-none",
              "text-text",
              "[&::-webkit-calendar-picker-indicator]:hidden",
              "[&::-webkit-datetime-edit]:p-0",
              "[&::-webkit-datetime-edit-fields-wrapper]:p-0",
              "[&::-webkit-datetime-edit-hour-field]:p-0",
              "[&::-webkit-datetime-edit-minute-field]:p-0",
              "[&::-webkit-datetime-edit-ampm-field]:p-0",
              "[&::-webkit-datetime-edit-text]:p-0",
              "disabled:cursor-not-allowed"
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)
TimeInput.displayName = "TimeInput"

export { TimeInput }
