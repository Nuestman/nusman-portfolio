"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { FilePickField } from "@/components/file-pick-field";
import { fieldClassName } from "@/lib/forms";
import {
  messageBodyPlainText,
  type MessageBodyFormat,
} from "@/lib/message-body";
import { cn } from "@/lib/utils";

const ATTACHMENT_MAX_COUNT = 3;

type MessageComposerProps = {
  id?: string;
  name?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  /** Starting mode; defaults to plain. */
  defaultFormat?: MessageBodyFormat;
  /** Desk chat bar vs labeled form field. */
  variant?: "compact" | "field";
  className?: string;
  /** Enter submits in plain compact mode (Shift+Enter for newline). */
  submitOnEnter?: boolean;
  autofocus?: boolean;
  disabled?: boolean;
  /** PNG/JPEG/WebP/PDF — up to 3 files, field name `attachments`. */
  allowAttachments?: boolean;
  /** Send control (compact) or extra controls beside the toggle. */
  actions?: ReactNode;
  hint?: ReactNode;
};

function ModeToggle({
  format,
  onChange,
  disabled,
}: {
  format: MessageBodyFormat;
  onChange: (next: MessageBodyFormat) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-0.5 text-[11px] font-medium"
      role="group"
      aria-label="Message format"
    >
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          format === "plain"
            ? "bg-white text-dark-950 shadow-sm"
            : "text-gray-500 hover:text-dark-950",
        )}
        onClick={() => onChange("plain")}
      >
        Plain text
      </button>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          format === "html"
            ? "bg-white text-dark-950 shadow-sm"
            : "text-gray-500 hover:text-dark-950",
        )}
        onClick={() => onChange("html")}
      >
        Rich text
      </button>
    </div>
  );
}

export function MessageComposer({
  id: idProp,
  name = "body",
  defaultValue = "",
  required = false,
  placeholder = "Write a message…",
  defaultFormat = "plain",
  variant = "field",
  className,
  submitOnEnter = false,
  autofocus = false,
  disabled = false,
  allowAttachments = false,
  actions,
  hint,
}: MessageComposerProps) {
  const reactId = useId();
  const fieldId = idProp ?? `message-body-${reactId}`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const [format, setFormat] = useState<MessageBodyFormat>(defaultFormat);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (autofocus && format === "plain") {
      textareaRef.current?.focus();
    }
  }, [autofocus, format]);

  function switchFormat(next: MessageBodyFormat) {
    if (next === format) {
      return;
    }
    if (next === "plain") {
      const fromEditor =
        editorRef.current?.getContent({ format: "html" }) ?? value;
      setValue(messageBodyPlainText(fromEditor));
      editorRef.current = null;
      setFormat("plain");
      return;
    }
    const plain = textareaRef.current?.value ?? value;
    setValue(plain);
    setFormat("html");
  }

  const attachmentInput = allowAttachments ? (
    <div className="px-1">
      <FilePickField
        id={`${fieldId}-attachments`}
        name="attachments"
        multiple
        maxFiles={ATTACHMENT_MAX_COUNT}
        disabled={disabled}
        accept="image/png,image/jpeg,image/webp,application/pdf"
        label="Attachments (optional)"
        hint={
          <p className="mt-1 text-[11px] text-gray-400">
            Up to {ATTACHMENT_MAX_COUNT} files · PNG, JPEG, WebP, or PDF · 5 MB
            each
          </p>
        }
      />
    </div>
  ) : null;

  const formatInput = (
    <input type="hidden" name="bodyFormat" value={format} />
  );

  const toggle = (
    <ModeToggle format={format} onChange={switchFormat} disabled={disabled} />
  );

  if (format === "plain") {
    const textarea = (
      <textarea
        ref={textareaRef}
        id={fieldId}
        name={name}
        required={required}
        disabled={disabled}
        rows={variant === "compact" ? 1 : 4}
        value={value}
        placeholder={placeholder}
        className={
          variant === "compact"
            ? "max-h-36 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-[15px] text-dark-950 outline-none placeholder:text-gray-400"
            : fieldClassName
        }
        onChange={(event) => setValue(event.target.value)}
        onInput={
          variant === "compact"
            ? (event) => {
                const el = event.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
              }
            : undefined
        }
        onKeyDown={
          submitOnEnter
            ? (event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }
            : undefined
        }
      />
    );

    if (variant === "compact") {
      return (
        <div className={cn("w-full space-y-2", className)}>
          <div className="flex justify-end px-1">{toggle}</div>
          {formatInput}
          {attachmentInput}
          <div className="flex items-end gap-2 rounded-[1.25rem] border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-200">
            <label htmlFor={fieldId} className="sr-only">
              Message
            </label>
            {textarea}
            {actions}
          </div>
          {hint}
        </div>
      );
    }

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1" />
          {toggle}
        </div>
        {formatInput}
        {textarea}
        {attachmentInput}
        {actions}
        {hint}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-end gap-2 px-1">
        {toggle}
      </div>
      {formatInput}
      <input type="hidden" name={name} value={value} required={required} />
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500",
          variant === "compact" && "rounded-[1.25rem]",
        )}
      >
        <Editor
          id={`${fieldId}-rich`}
          licenseKey="gpl"
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={value}
          disabled={disabled}
          onInit={(_event, editor) => {
            editorRef.current = editor;
            if (autofocus) {
              editor.focus();
            }
          }}
          onEditorChange={(content) => setValue(content)}
          init={{
            menubar: false,
            statusbar: false,
            branding: false,
            promotion: false,
            height: variant === "compact" ? 220 : 280,
            plugins: [
              "lists",
              "advlist",
              "link",
              "autolink",
              "table",
              "codesample",
            ],
            block_formats: "Paragraph=p; Heading 2=h2; Heading 3=h3",
            toolbar:
              "blocks | bold italic underline strikethrough | bullist numlist checklist checklisttoggle | blockquote codesample | link table | removeformat",
            placeholder,
            content_style: [
              "body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-size: 15px; line-height: 1.5; color: #0a0a0a; margin: 12px; }",
              "a { color: #b45309; }",
              "h2 { font-size: 1.2em; font-weight: 600; margin: 0.6em 0 0.35em; }",
              "h3 { font-size: 1.05em; font-weight: 600; margin: 0.5em 0 0.3em; }",
              "blockquote { border-left: 3px solid #d1d5db; margin: 0.5em 0; padding-left: 0.75rem; color: #4b5563; }",
              "pre { background: rgba(0,0,0,0.05); border-radius: 6px; padding: 0.6rem 0.75rem; overflow-x: auto; font-size: 0.85em; }",
              "code { font-family: ui-monospace, monospace; font-size: 0.9em; }",
              "table { border-collapse: collapse; width: 100%; margin: 0.5em 0; font-size: 0.95em; }",
              "th, td { border: 1px solid #e5e7eb; padding: 0.35rem 0.5rem; text-align: left; }",
              "th { background: rgba(0,0,0,0.04); font-weight: 600; }",
              "ul.msg-checklist { list-style: none; padding-left: 0.15rem; }",
              "ul.msg-checklist li { position: relative; padding-left: 1.5rem; margin: 0.25rem 0; }",
              "ul.msg-checklist li::before { content: '☐'; position: absolute; left: 0; }",
              "ul.msg-checklist li.msg-checklist--checked::before { content: '☑'; }",
            ].join(" "),
            skin_url: "/tinymce/skins/ui/oxide",
            content_css: "/tinymce/skins/content/default/content.min.css",
            setup: (editor) => {
              editor.ui.registry.addButton("checklist", {
                tooltip: "Checklist",
                text: "☐",
                onAction: () => {
                  editor.insertContent(
                    '<ul class="msg-checklist"><li>Checklist item</li></ul>',
                  );
                },
              });
              editor.ui.registry.addButton("checklisttoggle", {
                tooltip: "Toggle checklist item",
                text: "☑",
                onAction: () => {
                  const li = editor.dom.getParent(
                    editor.selection.getNode(),
                    "li",
                  );
                  const list = li
                    ? editor.dom.getParent(li, "ul.msg-checklist")
                    : null;
                  if (!li || !list) {
                    return;
                  }
                  editor.undoManager.transact(() => {
                    editor.dom.toggleClass(li, "msg-checklist--checked");
                  });
                  editor.dispatch("input");
                  editor.dispatch("change");
                  editor.nodeChanged();
                },
              });
            },
          }}
        />
      </div>
      {attachmentInput}
      {actions ? (
        <div className="flex justify-end px-1">{actions}</div>
      ) : null}
      {hint}
    </div>
  );
}
