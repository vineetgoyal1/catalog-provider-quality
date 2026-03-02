import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "@ui5/webcomponents/dist/BusyIndicator.js";

/* ========================================
   BUTTON COMPONENT
   SAP LeanIX Design System

   Exact sizing per documentation:
   - Small: height 20px, padding 3px 7px, font-size 12px, line-height 12px
   - Medium: height 24px, padding 3px 7px, font-size 14px, line-height 16px
   - Large: height 32px, padding 7px 11px, font-size 14px, line-height 16px
   ======================================== */

const lxButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-normal transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 border rounded-[3px]",
  {
    variants: {
      colorScheme: {
        default:
          "text-lx-gray-20 bg-lx-gray-95 border-lx-gray-95 hover:bg-lx-gray-90 hover:border-lx-gray-90 active:bg-lx-gray-80 active:border-lx-gray-80",
        primary:
          "text-primary-foreground bg-primary border-primary hover:bg-lx-brand-hover hover:border-lx-brand-hover active:bg-lx-brand-active active:border-lx-brand-active",
        danger:
          "text-white bg-destructive border-destructive hover:bg-lx-red-hover hover:border-lx-red-hover active:bg-lx-red-active active:border-lx-red-active",
        success:
          "text-white bg-success border-success hover:bg-lx-green-hover hover:border-lx-green-hover active:bg-lx-green-active active:border-lx-green-active",
      },
      mode: {
        solid: "",
        outline: "bg-white",
        ghost: "bg-transparent border-transparent",
        link: "bg-transparent border-none hover:underline",
      },
      size: {
        // Small: 20px height, 3px 7px padding, 12px font, 12px line-height
        small: "h-5 py-[3px] px-[7px] text-sm leading-[12px] [&_svg]:h-3 [&_svg]:w-3",
        // Medium: 24px height, 3px 7px padding, 14px font, 16px line-height
        medium: "h-6 py-[3px] px-[7px] text-md leading-[16px] [&_svg]:h-4 [&_svg]:w-4",
        // Large: 32px height, 7px 11px padding, 14px font, 16px line-height
        large: "h-8 py-[7px] px-[11px] text-md leading-[16px] [&_svg]:h-4 [&_svg]:w-4",
        auto: "h-auto p-0",
      },
      square: {
        true: "",
        false: "",
      },
      circle: {
        true: "rounded-full",
        false: "",
      },
    },
    compoundVariants: [
      // Outline mode colorScheme overrides
      {
        mode: "outline",
        colorScheme: "default",
        className: "border-lx-gray-90 hover:bg-lx-gray-95 hover:border-lx-gray-90",
      },
      {
        mode: "outline",
        colorScheme: "primary",
        className: "text-primary border-primary hover:bg-primary/10",
      },
      {
        mode: "outline",
        colorScheme: "danger",
        className: "text-destructive border-destructive hover:bg-destructive/10",
      },
      {
        mode: "outline",
        colorScheme: "success",
        className: "text-success border-success hover:bg-success/10",
      },
      // Ghost mode colorScheme overrides
      {
        mode: "ghost",
        colorScheme: "default",
        className: "hover:bg-lx-gray-95",
      },
      {
        mode: "ghost",
        colorScheme: "primary",
        className: "text-primary hover:bg-primary/10",
      },
      {
        mode: "ghost",
        colorScheme: "danger",
        className: "text-destructive hover:bg-destructive/10",
      },
      {
        mode: "ghost",
        colorScheme: "success",
        className: "text-success hover:bg-success/10",
      },
      // Link mode colorScheme overrides
      {
        mode: "link",
        colorScheme: "default",
        className: "text-lx-gray-20",
      },
      {
        mode: "link",
        colorScheme: "primary",
        className: "text-primary",
      },
      {
        mode: "link",
        colorScheme: "danger",
        className: "text-destructive",
      },
      {
        mode: "link",
        colorScheme: "success",
        className: "text-success",
      },
      // Square buttons - width equals height
      {
        square: true,
        size: "small",
        className: "w-5 px-0",
      },
      {
        square: true,
        size: "medium",
        className: "w-6 px-0",
      },
      {
        square: true,
        size: "large",
        className: "w-8 px-0",
      },
      // Circle buttons with proper border-radius per size
      {
        circle: true,
        size: "small",
        className: "w-5 px-0 rounded-[10px]",
      },
      {
        circle: true,
        size: "medium",
        className: "w-6 px-0 rounded-[11px]",
      },
      {
        circle: true,
        size: "large",
        className: "w-8 px-0 rounded-[15px]",
      },
    ],
    defaultVariants: {
      colorScheme: "default",
      mode: "solid",
      size: "large",
      square: false,
      circle: false,
    },
  }
);

export interface LxButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof lxButtonVariants> {
  asChild?: boolean;
  showSpinner?: boolean;
  pressed?: boolean;
  selected?: boolean;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const LxButton = React.forwardRef<HTMLButtonElement, LxButtonProps>(
  (
    {
      className,
      colorScheme,
      mode,
      size,
      square,
      circle,
      asChild = false,
      showSpinner = false,
      pressed = false,
      selected = false,
      disabled,
      icon,
      endIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const stateClasses = cn(
      pressed && "!bg-lx-gray-80",
      selected && "!bg-lx-gray-90"
    );

    // Loading state: show half-opacity background per documentation
    const loadingClasses = showSpinner && "relative text-transparent opacity-50";

    return (
      <Comp
        className={cn(
          lxButtonVariants({ colorScheme, mode, size, square, circle }),
          stateClasses,
          loadingClasses,
          className
        )}
        ref={ref}
        disabled={disabled || showSpinner}
        aria-pressed={pressed}
        aria-selected={selected}
        {...props}
      >
        {showSpinner && (
          <span className="absolute inset-0 flex items-center justify-center opacity-100">
            {React.createElement("ui5-busy-indicator", {
              active: true,
              size: "S",
            } as React.HTMLAttributes<HTMLElement>)}
          </span>
        )}
        {icon}
        {children}
        {endIcon}
      </Comp>
    );
  }
);
LxButton.displayName = "LxButton";

export { LxButton, lxButtonVariants };
