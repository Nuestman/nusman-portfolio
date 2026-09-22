"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function assignFiles(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  for (const file of files) {
    transfer.items.add(file);
  }
  input.files = transfer.files;
}

export function FilePickField({
  id: idProp,
  name,
  accept,
  multiple = false,
  maxFiles = 1,
  disabled = false,
  required = false,
  label,
  labelClassName,
  hint,
  className,
  inputClassName,
}: {
  id?: string;
  name: string;
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  labelClassName?: string;
  hint?: ReactNode;
  className?: string;
  inputClassName?: string;
}) {
  const reactId = useId();
  const fieldId = idProp ?? `file-${reactId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function setSelected(next: File[]) {
    const capped = multiple ? next.slice(0, maxFiles) : next.slice(0, 1);
    setFiles(capped);
    if (inputRef.current) {
      assignFiles(inputRef.current, capped);
    }
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    setSelected(Array.from(event.target.files ?? []));
  }

  function removeAt(index: number) {
    setSelected(files.filter((_, i) => i !== index));
  }

  function clearAll() {
    setSelected([]);
  }

  return (
    <div className={cn(files.length > 0 ? "space-y-2" : undefined, className)}>
      {label ? (
        <label
          htmlFor={fieldId}
          className={
            labelClassName ?? "mb-1 block text-[11px] font-medium text-gray-500"
          }
        >
          {label}
        </label>
      ) : null}
      <input
        ref={inputRef}
        id={fieldId}
        name={name}
        type="file"
        multiple={multiple}
        disabled={disabled}
        required={required && files.length === 0}
        accept={accept}
        onChange={onPick}
        className={
          inputClassName ??
          "block w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-dark-950 hover:file:bg-gray-200"
        }
      />
      {files.length > 0 ? (
        <ul className="space-y-1.5" aria-label="Selected files">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate text-dark-950">
                {file.name}
                <span className="ml-2 text-gray-500">
                  {formatBytes(file.size)}
                </span>
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(index)}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-white hover:text-dark-950 disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {files.length > 1 ? (
        <button
          type="button"
          disabled={disabled}
          onClick={clearAll}
          className="text-xs font-medium text-gray-500 hover:text-dark-950 disabled:opacity-50"
        >
          Clear all
        </button>
      ) : null}
      {hint}
    </div>
  );
}
