import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X, Info, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

/* ========================================
   LxBanner COMPONENT SYSTEM
   Source: LeanIX Pathfinder Web
   Path: libs/components/src/lib/notification-ui/components/banner/
   Angular: banner.component.ts

   Features:
   - Notification banner for displaying messages
   - Multiple severity levels (info, warning, success, danger, gray)
   - Dismissible state with close button
   - Size variants (big, small) for different contexts
   - Consistent icon and color theming per LeanIX design system
   ======================================== */

const lxBannerVariants = cva(
  "relative flex items-start gap-m border-l-[2px]",
  {
    variants: {
      type: {
        info: "border-l-lx-blue bg-blue-50",
        warning: "border-l-lx-yellow bg-yellow-50",
        success: "border-l-lx-green bg-green-50",
        danger: "border-l-lx-red bg-red-50",
        gray: "border-l-lx-gray-60 bg-lx-gray-95",
      },
      size: {
        big: "p-m",
        small: "p-s",
      },
    },
    defaultVariants: {
      type: "info",
      size: "big",
    },
  }
);

const iconContainerVariants = cva(
  "flex items-center justify-center shrink-0 rounded-full",
  {
    variants: {
      type: {
        info: "bg-lx-blue text-white",
        warning: "bg-lx-yellow text-white",
        success: "bg-lx-green text-white",
        danger: "bg-lx-red text-white",
        gray: "bg-lx-gray-60 text-white",
      },
      size: {
        big: "h-6 w-6",
        small: "h-5 w-5",
      },
    },
    defaultVariants: {
      type: "info",
      size: "big",
    },
  }
);

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  danger: AlertCircle,
  gray: Info,
};

export interface LxBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof lxBannerVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const LxBanner = React.forwardRef<HTMLDivElement, LxBannerProps>(
  (
    {
      className,
      type = "info",
      size = "big",
      title,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);
    const Icon = iconMap[type || "info"];
    const iconSize = size === "small" ? "h-3 w-3" : "h-3.5 w-3.5";

    if (dismissed) return null;

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    return (
      <div
        ref={ref}
        className={cn(lxBannerVariants({ type, size }), className)}
        role="alert"
        {...props}
      >
        <div className={cn(iconContainerVariants({ type, size }))}>
          <Icon className={iconSize} />
        </div>
        <div className="flex-1 min-w-0 text-lx-gray-20">
          {title && (
            <p className={cn(
              "font-semibold",
              size === "small" ? "text-sm mb-0" : "text-md mb-xs"
            )}>
              {title}
            </p>
          )}
          <div className={size === "small" ? "text-sm" : "text-md"}>
            {children}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors text-lx-gray-50 hover:text-lx-gray-20"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
LxBanner.displayName = "LxBanner";

export { LxBanner, lxBannerVariants };
