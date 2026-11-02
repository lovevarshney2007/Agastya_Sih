import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
} from 'react';

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  function Table({ className = '', ...props }, ref) {
    return (
      <div className="w-full overflow-x-auto border-t border-slate-200">
        <table
          ref={ref}
          className={`w-full border-collapse text-left text-xs text-slate-800 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className = '', ...props }, ref) {
    return <thead ref={ref} className={`bg-slate-50 border-b border-slate-200 ${className}`} {...props} />;
  }
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className = '', ...props }, ref) {
    return <tbody ref={ref} className={`divide-y divide-slate-100 bg-white ${className}`} {...props} />;
  }
);

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className = '', ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={`transition-colors duration-100 hover:bg-slate-50/80 data-[state=selected]:bg-slate-100 ${className}`}
        {...props}
      />
    );
  }
);

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  function TableHead({ className = '', ...props }, ref) {
    return (
      <th
        ref={ref}
        className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap select-none ${className}`}
        {...props}
      />
    );
  }
);

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className = '', ...props }, ref) {
    return (
      <td
        ref={ref}
        className={`px-3 py-2 text-xs align-middle text-slate-700 ${className}`}
        {...props}
      />
    );
  }
);

export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  function TableCaption({ className = '', ...props }, ref) {
    return (
      <caption
        ref={ref}
        className={`mt-2 text-xs text-slate-500 italic ${className}`}
        {...props}
      />
    );
  }
);
