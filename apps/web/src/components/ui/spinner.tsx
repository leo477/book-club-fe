import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

// role=status + default label match hlm-spinner; motion-safe keeps prefers-reduced-motion users spin-free.
function Spinner({
  className,
  "aria-label": ariaLabel = "Loading",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="spinner"
      role="status"
      aria-label={ariaLabel}
      className={cn("inline-flex size-fit text-base motion-safe:animate-spin", className)}
      {...props}
    >
      <Loader2Icon className="size-[1em]" />
    </span>
  )
}

export { Spinner }
