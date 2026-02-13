
import * as React from "react"
import { cn } from "@/lib/utils"

// Button
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "secondary" | "ghost";
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-purple-600 text-white hover:bg-purple-700",
            outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-100",
            secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
            ghost: "hover:bg-zinc-800 text-zinc-100"
        }
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
                    variants[variant],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
