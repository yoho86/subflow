"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface Props {
  value: number;
  formatter?: (v: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, formatter, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(prevValue.current, value, {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      onUpdate(v) {
        node.textContent = formatter ? formatter(v) : String(Math.round(v));
      },
    });

    prevValue.current = value;

    return () => controls.stop();
  }, [value, formatter]);

  return (
    <span ref={ref} className={className}>
      {formatter ? formatter(value) : String(Math.round(value))}
    </span>
  );
}
