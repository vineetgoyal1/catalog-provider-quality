import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function SimpleModal({
  isOpen,
  onClose,
  children,
  className,
  size = 'xl'
}: SimpleModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container - scrollable */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Content */}
        <div
          className={cn(
            'relative w-full bg-white rounded-lg shadow-xl',
            'my-8 overflow-hidden',
            'animate-in zoom-in-95 fade-in duration-200',
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}

export function SimpleModalHeader({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 p-6 pb-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SimpleModalTitle({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-gray-900',
        className
      )}
    >
      {children}
    </h2>
  );
}

export function SimpleModalDescription({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-gray-600', className)}>
      {children}
    </p>
  );
}

export function SimpleModalContent({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-6 py-4 overflow-y-auto',
        className
      )}
      style={{ maxHeight: '60vh' }}
    >
      {children}
    </div>
  );
}

export function SimpleModalFooter({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        'px-6 py-4 border-t border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}
