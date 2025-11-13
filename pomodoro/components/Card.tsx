"use client";

import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Card({
  children,
  variant = "primary",
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        "px-4 py-2 rounded-lg font-medium transition-colors select-none",
        {
          "bg-[var(--card)] text-black border-2 border-zinc-100": variant === "primary",
          "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600":
            variant === "secondary",
          "bg-transparent text-current hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50":
            variant === "ghost",
        },
        className
      )}
    >
      {children}
    </div>
  );
}
