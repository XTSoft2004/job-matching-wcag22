import React, { useEffect, useRef, ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  triggerRef?: React.RefObject<HTMLElement>;
  maxWidth?: string;
  /** Dùng role="alertdialog" cho confirmation dialogs yêu cầu phản hồi ngay */
  variant?: 'dialog' | 'alertdialog';
}

export default function AccessibleModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  triggerRef,
  maxWidth = 'max-w-lg',
  variant = 'dialog'
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trapping - WCAG 2.4.3
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      // Move focus into modal - WCAG 10 Focus Management
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      // Restore focus to trigger - WCAG 10
      if (triggerRef?.current) {
        setTimeout(() => {
          triggerRef.current?.focus();
        }, 0);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
      aria-hidden="false"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-3xl border border-gray-200 shadow-2xl ${maxWidth} w-full p-6 relative overflow-hidden animate-slide-up text-left`}
        role={variant}
        aria-modal="true"
        aria-labelledby="modal-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-heading" className="text-xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Đóng hộp thoại"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

// ConfirmDialog - WCAG Accessible Confirmation (thay thế window.confirm)
interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  triggerRef
}: ConfirmDialogProps) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onCancel}
      title={
        <span className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          {title}
        </span>
      }
      variant="alertdialog"
      maxWidth="max-w-md"
      triggerRef={triggerRef}
    >
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          {confirmLabel}
        </button>
      </div>
    </AccessibleModal>
  );
}
