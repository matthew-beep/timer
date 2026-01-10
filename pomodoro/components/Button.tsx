"use client";

import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glass" | "plain" | "glassPlain";
  isActive?: boolean; // Add this prop
}

export function Button({
  children,
  variant = "primary",
  className,
  isActive = false,
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
          "hover:scale-105 text-active bg-active/20 border-active/30 border":variant === "glass",
          "text-white/50 hover:bg-white/10 hover:text-white ":variant === "plain" && !isActive,
          "text-white bg-white/10":variant === "plain" && isActive,
          "hover:scale-105 text-white border-white/10 border bg-[#0a1929]/60 backdrop-blur-md hover:bg-white/20 shadow-md hover:shadow-2xl transition-all duration-150":variant === "glassPlain",
        },
        className
      )}
    >
      {children}
    </button>
  );
}

