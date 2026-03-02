import * as React from "react";
import { cn } from "@/lib/utils";
import { LxButton } from "./lx-button";

/* ========================================
   EMPTY STATE COMPONENT
   SAP LeanIX Design System

   Display when no content is available.
   Includes icon, title, description, and CTA buttons.
   ======================================== */

export interface LxEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main title text */
  title: string;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Primary CTA button label */
  buttonLabel?: string;
  /** Secondary CTA button label */
  secondaryButtonLabel?: string;
  /** Loading state for primary button */
  loading?: boolean;
  /** "Learn more" or similar link label */
  moreLinkLabel?: string;
  /** URL for more link */
  moreLink?: string;
  /** Open more link in new tab */
  openMoreLinkInNewTab?: boolean;
  /** Size variant */
  size?: "small" | "medium";
  /** Primary button click handler */
  onButtonClick?: (e: React.MouseEvent) => void;
  /** Secondary button click handler */
  onSecondaryButtonClick?: (e: React.MouseEvent) => void;
  /** More link click handler */
  onMoreLinkClick?: (e: React.MouseEvent) => void;
}

const LxEmptyState = React.forwardRef<HTMLDivElement, LxEmptyStateProps>(
  (
    {
      className,
      title,
      icon,
      buttonLabel,
      secondaryButtonLabel,
      loading = false,
      moreLinkLabel,
      moreLink,
      openMoreLinkInNewTab = true,
      size = "medium",
      onButtonClick,
      onSecondaryButtonClick,
      onMoreLinkClick,
      children,
      ...props
    },
    ref
  ) => {
    const titleSize = size === "small" ? "text-md" : "text-2xl";
    const contentSize = size === "small" ? "text-sm" : "text-md";

    return (
      <div
        ref={ref}
        className={cn("flex justify-center", className)}
        {...props}
      >
        <div className="flex flex-col items-center text-center max-w-md">
          {/* Icon with shadow */}
          {icon && (
            <div className="relative mb-4">
              <div className="w-8 h-8 text-lx-gray-60">{icon}</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-11 h-1.5 bg-lx-gray-95 rounded-full" />
            </div>
          )}

          {/* Title */}
          <h3
            className={cn(
              "font-semibold text-lx-gray-20 mb-2",
              titleSize
            )}
          >
            {title}
          </h3>

          {/* Description (children) */}
          {children && (
            <div className={cn("text-lx-gray-50 mb-4", contentSize)}>
              {children}
            </div>
          )}

          {/* Action buttons */}
          {(buttonLabel || secondaryButtonLabel) && (
            <div className="flex gap-2 mt-2">
              {buttonLabel && (
                <LxButton
                  colorScheme="primary"
                  onClick={onButtonClick}
                  showSpinner={loading}
                >
                  {buttonLabel}
                </LxButton>
              )}
              {secondaryButtonLabel && (
                <LxButton
                  colorScheme="default"
                  mode="outline"
                  onClick={onSecondaryButtonClick}
                >
                  {secondaryButtonLabel}
                </LxButton>
              )}
            </div>
          )}

          {/* More link */}
          {moreLinkLabel && moreLink && (
            <a
              href={moreLink}
              target={openMoreLinkInNewTab ? "_blank" : undefined}
              rel={openMoreLinkInNewTab ? "noopener noreferrer" : undefined}
              onClick={onMoreLinkClick}
              className="mt-4 text-primary hover:underline text-sm"
            >
              {moreLinkLabel}
            </a>
          )}
        </div>
      </div>
    );
  }
);
LxEmptyState.displayName = "LxEmptyState";

export { LxEmptyState };
