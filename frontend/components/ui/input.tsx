const BASE_INPUT_CLASSES =
  "border border-border rounded-md px-3 py-2.5 text-base transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 dark:bg-slate-800 dark:text-white w-full";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
}

export function Input({ label, helper, className = "", id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
        </label>
      )}
      <input id={id} className={`${BASE_INPUT_CLASSES} ${className}`} {...props} />
      {helper && <span className="text-sm text-text-secondary">{helper}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
}

export function Textarea({ label, helper, className = "", id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`${BASE_INPUT_CLASSES} min-h-[120px] resize-y ${className}`}
        {...props}
      />
      {helper && <span className="text-sm text-text-secondary">{helper}</span>}
    </div>
  );
}
