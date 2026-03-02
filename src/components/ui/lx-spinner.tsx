import * as React from "react";
import { cn } from "@/lib/utils";

/* ========================================
   SPINNER COMPONENT
   SAP LeanIX Design System

   Classic LeanIX loading spinner with animated bars.
   Note: For inline loading, prefer ui5-busy-indicator.
   ======================================== */

export interface LxSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fill the entire parent container */
  fullSpace?: boolean;
  /** Fill the entire viewport */
  fullSpaceFixed?: boolean;
  /** Add semi-transparent white background overlay */
  fadeBackground?: boolean;
}

const LxSpinner = React.forwardRef<HTMLDivElement, LxSpinnerProps>(
  (
    {
      className,
      fullSpace = false,
      fullSpaceFixed = false,
      fadeBackground = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-[2rem]",
          fullSpace && "absolute inset-0 z-[1000]",
          fullSpaceFixed && "fixed inset-0 z-[1000]",
          fadeBackground && "bg-white/60",
          className
        )}
        {...props}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-[25px] w-[55px] items-center justify-center gap-[2px] text-center text-[11.25px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-full w-[6px] animate-[lx-stretch_1.2s_ease-in-out_infinite] bg-lx-brand"
                style={{ animationDelay: `${-1.2 + i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);
LxSpinner.displayName = "LxSpinner";

export { LxSpinner };
