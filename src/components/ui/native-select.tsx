import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NativeSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

export function NativeSelect({
    className,
    children,
    ...props
}: NativeSelectProps) {
    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-9 w-full appearance-none items-center rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm shadow-sm ring-offset-background",
                    "focus:outline-none focus:ring-1 focus:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "text-foreground",
                    className
                )}
                {...props}
            >
                {children}
            </select>

            <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
            />
        </div>
    );
}