"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type Part = "description" | "error"

interface FieldContextValue {
  controlId: string
  descriptionId: string
  errorId: string
  invalid: boolean
  parts: ReadonlySet<Part>
  register: (part: Part) => () => void
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

const fieldVariants = cva("group/field flex w-full gap-3 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal: [
        "flex-row items-center",
        "*:data-[slot=field-label]:flex-auto",
        "has-[>[data-slot=field-content]]:items-start",
      ],
      responsive: [
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto [&>.sr-only]:w-auto",
        "@md/field-group:*:data-[slot=field-label]:flex-auto",
        "@md/field-group:has-[>[data-slot=field-content]]:items-start",
      ],
    },
  },
  defaultVariants: { orientation: "vertical" },
})

function Field({
  className,
  orientation = "vertical",
  invalid = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & { invalid?: boolean }) {
  const id = React.useId()
  const [parts, setParts] = React.useState<ReadonlySet<Part>>(new Set())
  const register = React.useCallback((part: Part) => {
    setParts((prev) => new Set(prev).add(part))
    return () =>
      setParts((prev) => {
        const next = new Set(prev)
        next.delete(part)
        return next
      })
  }, [])

  return (
    <FieldContext.Provider
      value={{
        controlId: `${id}-control`,
        descriptionId: `${id}-description`,
        errorId: `${id}-error`,
        invalid,
        parts,
        register,
      }}
    >
      <div
        role="group"
        data-slot="field"
        data-orientation={orientation}
        data-invalid={invalid || undefined}
        className={cn(fieldVariants({ orientation }), className)}
        {...props}
      />
    </FieldContext.Provider>
  )
}

/** Merges id / aria-invalid / aria-describedby onto the single child control (Input, Textarea, ...). */
function FieldControl(props: React.ComponentProps<typeof Slot.Root>) {
  const ctx = React.useContext(FieldContext)
  if (!ctx) return <Slot.Root {...props} />
  const describedBy = [
    ctx.parts.has("description") && ctx.descriptionId,
    ctx.invalid && ctx.parts.has("error") && ctx.errorId,
  ].filter(Boolean)
  return (
    <Slot.Root
      id={ctx.controlId}
      aria-invalid={ctx.invalid || undefined}
      aria-describedby={describedBy.length ? describedBy.join(" ") : undefined}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const ctx = React.useContext(FieldContext)
  return (
    <Label
      data-slot="field-label"
      htmlFor={ctx?.controlId}
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, id, ...props }: React.ComponentProps<"p">) {
  const ctx = React.useContext(FieldContext)
  const register = ctx?.register
  React.useEffect(() => register?.("description"), [register])
  return (
    <p
      data-slot="field-description"
      id={id ?? ctx?.descriptionId}
      className={cn(
        "text-sm leading-normal font-normal text-muted-foreground last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

/** Shown only while the parent Field is invalid (or forceShow); standalone it always shows, like hlm-field-error. */
function FieldError({
  className,
  id,
  forceShow = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { forceShow?: boolean }) {
  const ctx = React.useContext(FieldContext)
  const register = ctx?.register
  const display = !ctx || forceShow || ctx.invalid
  React.useEffect(() => (display ? register?.("error") : undefined), [display, register])
  return (
    <div
      role="alert"
      data-slot="field-error"
      id={id ?? ctx?.errorId}
      hidden={!display}
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {display ? children : null}
    </div>
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1 leading-snug", className)}
      {...props}
    />
  )
}

export {
  Field,
  FieldControl,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldContent,
}
