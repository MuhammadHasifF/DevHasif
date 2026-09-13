"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "./settings-provider";
import { usePathname } from "next/navigation";

const EASE = [0.32, 0.72, 0, 1] as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reducedMotion: reduce } = useSettings();

  if (reduce) return <>{children}</>;

  return (
    <>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
    <CurtainOverlay key={`curtain-${pathname}`} />
    </>
  );
}

function CurtainOverlay() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] origin-bottom"
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      exit={{ scaleY: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        background:
          "linear-gradient(to top, var(--color-bg-0), color-mix(in oklab, var(--color-accent) 30%, var(--color-bg-0)))",
      }}
    />
  );
}
