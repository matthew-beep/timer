"use client";

import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glass";
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
        "font-medium transition-colors active:scale-[0.98] select-none cursor-pointer",
        {
          "bg-button-primary text-white hover:bg-button-primary/50": variant === "primary",
          "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600":
            variant === "secondary",
          "bg-transparent text-current hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50":
            variant === "ghost",
          "glass":variant === "glass",
        },
        className
      )}
    >
      {children}
    </button>
  );
}

