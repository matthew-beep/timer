"use client";

import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glass" | "plain";
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "font-medium transition-all duration-150 active:scale-95 select-none cursor-pointer",
        {
          "bg-button-primary text-white hover:bg-button-primary/50": variant === "primary",
          "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600":
            variant === "secondary",
          "bg-transparent text-current hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50":
            variant === "ghost",
          "hover:scale-105 text-cyan-400 bg-cyan-500/20 border-cyan-500/30 border":variant === "glass",
          "text-white/50 hover:bg-white/10 hover:text-white ":variant === "plain",
        },
        className
      )}
    >
      {children}
    </button>
  );
}

