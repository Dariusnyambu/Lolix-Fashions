import type { LucideIcon } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Loader2, Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';

export function StatCard({
  label,
  value,
  icon: Icon,
  tint = 'royal',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tint?: 'royal' | 'gold';
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-royal-400">{label}</span>
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full',
            tint === 'gold' ? 'gold-gradient text-royal-950' : 'purple-gradient text-white'
          )}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-royal-900">{value}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-bold text-royal-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-royal-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ label = 'Nothing here yet' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-royal-300">
      <Inbox size={32} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={26} className="animate-spin text-royal-400" />
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-royal-700">{label}</label>
      {children}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-royal-100 px-3 py-2 text-sm outline-none focus:border-royal-400',
        props.className
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-lg border border-royal-100 px-3 py-2 text-sm outline-none focus:border-royal-400',
        props.className
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-lg border border-royal-100 px-3 py-2 text-sm outline-none focus:border-royal-400 bg-white',
        props.className
      )}
    />
  );
}

export function CheckboxLabel({
  children,
  checked,
  onChange,
}: {
  children: ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-royal-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-royal-300 text-royal-700 focus:ring-royal-400"
      />
      {children}
    </label>
  );
}
