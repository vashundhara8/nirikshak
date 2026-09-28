import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", href, className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-primary focus:ring-offset-2 rounded";
    
    const variants = {
      primary: "bg-teal-primary text-white hover:bg-teal-800 shadow-sm border border-transparent",
      secondary: "bg-gold text-navy hover:bg-[#e0a83b] shadow-sm border border-transparent",
      outline: "bg-transparent text-teal-primary border-2 border-teal-primary hover:bg-teal-50",
      ghost: "bg-transparent text-text-primary hover:bg-slate-100",
      danger: "bg-status-error text-white hover:bg-red-800 shadow-sm border border-transparent",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2",
      lg: "px-8 py-3 text-lg",
    };
    
    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:pointer-events-none`;

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
