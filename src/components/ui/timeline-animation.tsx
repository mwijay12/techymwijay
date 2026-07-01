"use client";

import { motion, type Variants } from "framer-motion";
import { useRef, useEffect, useState, ElementType, type RefObject } from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  children: React.ReactNode;
  animationNum: number;
  timelineRef: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  as?: ElementType;
  [key: string]: unknown;
}

function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className,
  as: Tag = "div",
  ...props
}: TimelineContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const parent = timelineRef.current;
    if (!parent) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        root: parent,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [timelineRef]);

  const defaultVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: animationNum * 0.2,
        duration: 0.5,
      },
    },
  };

  const variants = customVariants || defaultVariants;

  const MotionTag = motion(Tag as ElementType);

  return (
    <MotionTag
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      custom={animationNum}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

export { TimelineContent };