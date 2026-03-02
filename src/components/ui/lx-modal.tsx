import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

/* ========================================
   LxModal COMPONENT SYSTEM
   Source: LeanIX Pathfinder Web
   Path: libs/components/src/lib/modal-ui/components/modal/
   Angular: modal.component.ts, modal-header.component.ts, modal-footer.component.ts

   Features:
   - Complex modal system with focus trapping using Radix UI Dialog
   - Size variants: 'dialog' | 'dialog-large'
   - Overlay management with proper z-index handling
   - Header/footer/content subcomponents
   - Close button and escape key handling
   - Animation support with CSS transitions
   - Vertical scroll configuration
   ======================================== */

// Modal variants
const modalVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-lx-gray-80 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
  {
    variants: {
      size: {
        dialog: "max-w-lg",
        "dialog-large": "max-w-4xl",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        full: "max-w-[95vw]",
      },
      maxHeight: {
        default: "max-h-[90vh]",
        full: "max-h-[95vh]",
        screen: "max-h-screen",
      },
    },
    defaultVariants: {
      size: "dialog",
      maxHeight: "default",
    },
  }
);

export interface LxModalProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Root>,
    VariantProps<typeof modalVariants> {
  /** Modal content */
  children: React.ReactNode;
  /** Custom modal content className */
  className?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Close button aria-label */
  closeButtonLabel?: string;
  /** Whether the modal can be closed by clicking the overlay */
  closeOnOverlayClick?: boolean;
  /** Whether the modal can be closed by pressing Escape */
  closeOnEscape?: boolean;
  /** Whether the modal content should be scrollable */
  scrollable?: boolean;
}

export interface LxModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Header title */
  title?: string;
  /** Whether to show the close button in header */
  showCloseButton?: boolean;
  /** Header content */
  children?: React.ReactNode;
}

export interface LxModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Footer content */
  children: React.ReactNode;
  /** Whether to add top border */
  bordered?: boolean;
}

export interface LxModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content */
  children: React.ReactNode;
  /** Whether content should be scrollable */
  scrollable?: boolean;
}

const LxModal = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  LxModalProps
>((({
  className,
  size,
  maxHeight,
  children,
  showCloseButton = true,
  closeButtonLabel = "Close modal",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  scrollable = true,
  ...props
}, ref) => {
  return (
    <Dialog.Root {...props}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          ref={ref}
          className={cn(
            modalVariants({ size, maxHeight }),
            scrollable && "overflow-hidden",
            className
          )}
          onPointerDownOutside={closeOnOverlayClick ? undefined : (e) => e.preventDefault()}
          onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
        >
          {showCloseButton && (
            <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-lx-brand-blue focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">{closeButtonLabel}</span>
            </Dialog.Close>
          )}

          <div className={cn("flex flex-col", scrollable && "min-h-0")}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}));

const LxModalTrigger = Dialog.Trigger;

const LxModalClose = Dialog.Close;

const LxModalHeader = React.forwardRef<HTMLDivElement, LxModalHeaderProps>(
  ({ className, title, showCloseButton = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5 text-center sm:text-left pb-4",
          showCloseButton && "pr-8",
          className
        )}
        {...props}
      >
        {title && (
          <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-lx-gray-20">
            {title}
          </Dialog.Title>
        )}

        {children}

        {showCloseButton && (
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-lx-brand-blue focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        )}
      </div>
    );
  }
);

const LxModalContent = React.forwardRef<HTMLDivElement, LxModalContentProps>(
  ({ className, scrollable = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1",
          scrollable && "overflow-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const LxModalFooter = React.forwardRef<HTMLDivElement, LxModalFooterProps>(
  ({ className, bordered = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4",
          bordered && "border-t border-lx-gray-90",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const LxModalTitle = Dialog.Title;

const LxModalDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-lx-gray-60", className)}
    {...props}
  />
));

// Set display names
LxModal.displayName = "LxModal";
LxModalTrigger.displayName = "LxModalTrigger";
LxModalClose.displayName = "LxModalClose";
LxModalHeader.displayName = "LxModalHeader";
LxModalContent.displayName = "LxModalContent";
LxModalFooter.displayName = "LxModalFooter";
LxModalTitle.displayName = "LxModalTitle";
LxModalDescription.displayName = "LxModalDescription";

export {
  LxModal,
  LxModalTrigger,
  LxModalClose,
  LxModalHeader,
  LxModalContent,
  LxModalFooter,
  LxModalTitle,
  LxModalDescription,
  modalVariants
};
