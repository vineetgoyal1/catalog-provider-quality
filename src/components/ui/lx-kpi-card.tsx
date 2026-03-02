/* ========================================
   KPI CARD
   Source: Figma - SAP LeanIX Web UI Kit
   Node ID: 2153:17510
   Converted: 2026-02-17
   Description: KPI cards display key performance indicators and metrics,
   typically positioned at the top of dashboards and pages to provide
   at-a-glance insights into important business data.
   ======================================== */

import * as React from "react";
import { cva } from "class-variance-authority";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { LxTooltip } from "./tooltip";

const lxKpiCardVariants = cva(
  "relative flex w-full flex-col gap-1 rounded bg-white p-4 shadow-low"
);

export interface LxKpiCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The main KPI value to display */
  kpiValue: string | number;
  /** Title text for the KPI */
  title?: string;
  /** Helper text displayed below the KPI value (e.g., "In last month") */
  helperText?: string;
  /** Show/hide the colored indicator dot in the header */
  showIndicator?: boolean;
  /** Color of the indicator dot */
  indicatorColor?: string;
  /** Show/hide the info tooltip icon */
  showTooltip?: boolean;
  /** Tooltip content (if showTooltip is true) */
  tooltipContent?: string;
  /** Optional action button in the header */
  headerAction?: React.ReactNode;
}

const LxKpiCard = React.forwardRef<HTMLDivElement, LxKpiCardProps>(
  (
    {
      className,
      kpiValue,
      title = "Title",
      helperText,
      showIndicator = true,
      indicatorColor = "bg-lx-brand-blue",
      showTooltip = true,
      tooltipContent,
      headerAction,
      ...props
    },
    ref
  ) => {
    return (
      <article
        ref={ref}
        className={cn(lxKpiCardVariants(), className)}
        {...props}
      >
        {/* Header */}
        <div className="flex h-6 w-full items-center gap-2">
          {/* Legend Indicator */}
          {showIndicator && (
            <div
              className={cn("size-2 shrink-0 rounded-full", indicatorColor)}
              aria-hidden="true"
            />
          )}

          {/* Title Section */}
          <div className="flex min-w-0 flex-1 items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <p className="truncate text-md font-normal text-lx-gray-20">
                {title}
              </p>

              {/* Tooltip Icon */}
              {showTooltip && (
                <LxTooltip content={tooltipContent || "More information"}>
                  <button
                    type="button"
                    className="shrink-0 text-lx-gray-70 hover:text-lx-gray-50 focus:outline-none focus:ring-2 focus:ring-lx-brand-blue focus:ring-offset-2"
                    aria-label="More information"
                  >
                    <Info className="size-4" />
                  </button>
                </LxTooltip>
              )}
            </div>

            {/* Optional Header Action */}
            {headerAction && (
              <div className="flex shrink-0 items-center">{headerAction}</div>
            )}
          </div>
        </div>

        {/* KPI Value and Helper Text */}
        <div className="flex flex-col items-start gap-1">
          <p className="whitespace-pre-wrap text-2xl font-bold text-lx-gray-20">
            {kpiValue}
          </p>

          {helperText && (
            <div className="flex h-5 items-center">
              <p className="text-sm font-normal text-lx-gray-50">
                {helperText}
              </p>
            </div>
          )}
        </div>
      </article>
    );
  }
);

LxKpiCard.displayName = "LxKpiCard";

export { LxKpiCard, lxKpiCardVariants };
