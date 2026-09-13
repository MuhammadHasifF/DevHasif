"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Section } from "@/components/primitives/section";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/../site.config";

/** Cycles through a few example messages as the textarea placeholder. */
const PLACEHOLDER_CYCLE = [
  "Hi Hasif, we're hiring a data and AI intern and your maritime analytics work looks relevant. Open to a chat?",
  "Could you walk me through how Campus Mind validates source-grounded model output?",
  "We're looking for an ML intern with strong Python and evaluation fundamentals. Interested?",
  "What trade-offs did you make while building BrainGit's agent and memory architecture?",
  "I'd like to learn more about your work on the open-source R3CAP platform.",
];

function useTypingPlaceholder(samples: string[]) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setText(samples[0]);
      return;
    }
    let i = 0;
    let charIdx = 0;
    let deleting = false;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (cancelled) return;
      const sample = samples[i];
      if (!deleting) {
        charIdx += 1;
        setText(sample.slice(0, charIdx));
        if (charIdx === sample.length) {
          deleting = true;
          timer = setTimeout(tick, 1800); // pause at full
          return;
        }
        timer = setTimeout(tick, 28 + Math.random() * 32);
      } else {
        charIdx -= 1;
        setText(sample.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          i = (i + 1) % samples.length;
          timer = setTimeout(tick, 360);
          return;
        }
        timer = setTimeout(tick, 14 + Math.random() * 14);
      }
    };
    timer = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [samples]);
  return text;
}

const schema = z.object({
  name: z.string().min(2, "Your name, please").max(80),
  email: z.string().email("Not a valid email"),
  company: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10, "A little more to go on?").max(5000),
  honeypot: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ContactInline() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasContent, setHasContent] = useState(false);
  const typingPlaceholder = useTypingPlaceholder(PLACEHOLDER_CYCLE);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const messageReg = register("message", {
    onChange: (e) => setHasContent(Boolean(e.target.value.length)),
  });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(15000),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? "Something broke on send");
      }
      if (!body.ok || body.dev) {
        throw new Error("This preview has not delivered your message. Please email me directly.");
      }
      setStatus("success");
      reset();
      setHasContent(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something broke on send");
      setStatus("error");
    }
  };

  return (
    <Section
      id="contact"
      eyebrow="CONTACT"
      index={7}
      total={7}
      stamp="// OPEN CHANNEL"
      title={["Open a channel."]}
      intro="Send a message about internships, research collaborations, or engineering projects. I'll reply from my actual inbox, usually within a few days."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="contact-channel relative grid gap-4 overflow-hidden rounded-2xl border border-[var(--color-accent)]/35 bg-gradient-to-br from-[#0b0307] via-[#1a0610] to-[#2a0418] p-6 shadow-[0_0_60px_-12px_color-mix(in_oklab,var(--color-accent)_55%,transparent)] md:grid-cols-2 md:p-8"
        aria-live="polite"
      >
        {/* Pink/cyber atmospheric gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #ff3a78 0%, color-mix(in oklab, var(--color-accent) 40%, transparent) 50%, transparent 80%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full opacity-45 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #ff5d9d 0%, color-mix(in oklab, var(--color-accent-3) 40%, transparent) 55%, transparent 85%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(255,90,130,0.06) 2px 3px)",
          }}
        />
        {/* Corner brackets */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-[var(--color-accent)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-[var(--color-accent)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 bottom-3 h-3 w-3 border-l border-b border-[var(--color-accent)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 bottom-3 h-3 w-3 border-r border-b border-[var(--color-accent)]"
        />
        {/* Channel header strip */}
        <div className="relative md:col-span-2 mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
          <span className="inline-flex items-center gap-2">
            <span className="status-dot" />
            channel open · welcoming signal
          </span>
          <span className="text-[var(--color-accent-3)]">{"//"} secure transmit</span>
        </div>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
          {...register("honeypot")}
        />

        <div className="relative">
          <Field id="name" label="Name" error={errors.name?.message}>
            <input id="name" autoComplete="name" {...register("name")} className={inputCls(!!errors.name)} />
          </Field>
        </div>
        <div className="relative">
          <Field id="email" label="Email" error={errors.email?.message}>
            <input id="email" type="email" autoComplete="email" {...register("email")} className={inputCls(!!errors.email)} />
          </Field>
        </div>
        <div className="relative md:col-span-2">
          <Field id="company" label="Org (optional)" error={errors.company?.message}>
            <input id="company" autoComplete="organization" {...register("company")} className={inputCls(!!errors.company)} />
          </Field>
        </div>
        <div className="relative md:col-span-2">
          <Field id="message" label="Message" error={errors.message?.message}>
            <div className="relative">
              <textarea
                id="message"
                rows={6}
                {...messageReg}
                placeholder=" "
                className={cn(
                  inputCls(!!errors.message),
                  "relative z-[1] bg-transparent",
                )}
              />
              {!hasContent && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-2.5 z-[2] max-w-[calc(100%-1.5rem)] font-mono text-sm leading-snug text-[var(--color-text-2)]"
                >
                  {typingPlaceholder}
                  <span
                    className="ml-0.5 inline-block h-[1em] w-[2px] -translate-y-[2px] align-middle bg-[var(--color-accent)]"
                    style={{ animation: "var(--animate-blink)" }}
                  />
                </div>
              )}
            </div>
          </Field>
        </div>

        <div className="relative md:col-span-2 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
            <span className="text-[var(--color-accent)]">›</span> direct{" "}
            <a href={siteConfig.links.email} className="text-[var(--color-text-1)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline">
              {siteConfig.email}
            </a>
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className={cn(
              "group inline-flex h-10 items-center gap-2 rounded-sm border px-5 font-mono text-[11px] uppercase tracking-[0.18em] transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-[var(--ease-apple)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
              status === "success"
                ? "border-[var(--color-success)] bg-[var(--color-success)] text-black"
                : "border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:shadow-[0_0_24px_-4px_var(--color-accent)]"
            )}
          >
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "success" && <Check className="h-4 w-4" />}
            {(status === "idle" || status === "error") && <Send className="h-4 w-4" />}
            {status === "loading"
              ? "Transmitting..."
              : status === "success"
              ? "Sent · standby"
              : "Transmit"}
          </button>
        </div>
        {status === "error" && error && (
          <div
            role="alert"
            className="md:col-span-2 border border-[var(--color-warning)]/40 bg-[color:color-mix(in_oklab,var(--color-warning)_10%,transparent)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-warning)]"
          >
            ! {error}
          </div>
        )}
      </form>
    </Section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
        <span className="text-[var(--color-accent)]">›</span> {label}
      </span>
      {children}
      {error && (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-warning)]">
          ! {error}
        </span>
      )}
    </label>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-md border bg-[color:color-mix(in_oklab,#1a0410_85%,transparent)] px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-[border-color,box-shadow] focus:border-[#ff3a78] focus:shadow-[0_0_0_1px_#ff3a78,0_0_24px_-4px_#ff3a78,inset_0_0_18px_-8px_#ff3a78]",
    hasError ? "border-[var(--color-warning)]" : "border-[#ff3a78]/30 hover:border-[#ff3a78]/55",
  );
}
