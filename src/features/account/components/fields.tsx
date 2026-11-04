import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-[#1F253F] outline-none transition-colors placeholder:text-cocoa/50 focus:border-gold";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: IconName;
  hint?: string;
  errors?: string[];
}

/** Labelled storefront-styled input with optional leading icon + errors. */
export function Field({ label, name, icon, hint, errors, ...rest }: FieldProps) {
  const describedBy = errors?.length ? `${name}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-[#1F253F]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <Icon
            name={icon}
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cocoa/60"
          />
        )}
        <input
          id={name}
          name={name}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClass, icon && "pl-9")}
          {...rest}
        />
      </div>
      {errors?.length ? (
        <p id={describedBy} className="text-sm text-red-600">
          {errors[0]}
        </p>
      ) : hint ? (
        <p className="text-xs text-cocoa/70">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  errors?: string[];
}

export function TextArea({ label, name, errors, ...rest }: TextAreaProps) {
  const describedBy = errors?.length ? `${name}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-[#1F253F]">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputClass, "resize-y")}
        {...rest}
      />
      {errors?.length ? (
        <p id={describedBy} className="text-sm text-red-600">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
