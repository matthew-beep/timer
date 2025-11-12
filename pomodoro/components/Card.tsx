"use client";

import clsx from "clsx";

interface CardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Card({
  children,
  variant = "primary",
  className,
  ...props
}: CardProps) {
  return (
    <button
      {...props}
      className={clsx(
        "px-4 py-2 rounded-lg font-medium transition-colors select-none",
        {
          "bg-purple-600 text-white": variant === "primary",
          "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600":
            variant === "secondary",
          "bg-transparent text-current hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50":
            variant === "ghost",
        },
        className
      )}
    >
      {children}
    </button>
  );
}