import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useTheme } from '@/contexts/ThemeContext';

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                primary: "", // Will be handled by theme
                cta: "", // Will be handled by theme
                danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white",

            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
                md: "h-10 px-4 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { isDark } = useTheme();

    const getVariantClass = () => {
        if (variant === 'primary' || variant === 'cta') {
            return isDark
                ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white font-black shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300/20"
                : "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white font-black shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-300/20"
        }
        if (variant === 'secondary') {
            return isDark
                ? "bg-slate-800/80 text-slate-100 hover:bg-slate-700 border border-slate-700/50"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
        }
        return ""
    }

    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }), getVariantClass())}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
