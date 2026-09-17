import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-royal-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-scale-in`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-royal-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-royal-400 hover:bg-royal-50">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
