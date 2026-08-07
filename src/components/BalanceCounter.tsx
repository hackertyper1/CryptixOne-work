import React, { useEffect, useRef } from 'react';
import { animate, useMotionValue, useTransform, motion } from 'motion/react';
import { formatIndianCurrency } from '../data';

interface BalanceCounterProps {
  value: number;
  className?: string;
}

export function BalanceCounter({ value, className }: BalanceCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => formatIndianCurrency(Math.round(latest)));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [value, count]);

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  );
}
