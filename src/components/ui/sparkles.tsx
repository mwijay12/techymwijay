"use client";

import { useEffect, useId, useState } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";

interface SparklesProps {
  className?: string;
  size?: number;
  minSize?: number | null;
  density?: number;
  speed?: number;
  minSpeed?: number | null;
  opacity?: number;
  opacitySpeed?: number;
  minOpacity?: number | null;
  color?: string;
  background?: string;
  direction?: "none" | "top" | "bottom" | "left" | "right";
  options?: Record<string, unknown>;
}

export function Sparkles({
  className,
  size = 1,
  minSize = null,
  density = 800,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = "#FFFFFF",
  background = "transparent",
  direction = "none",
  options = {},
}: SparklesProps) {
  const [isReady, setIsReady] = useState(false);
  const id = useId();

  useEffect(() => {
    const init = async () => {
      await (loadSlim as any)();
      setIsReady(true);
    };
    init();
  }, []);

  const defaultOptions = {
    background: { color: { value: background } },
    fullScreen: { enable: false, zIndex: 1 },
    fpsLimit: 120,
    particles: {
      color: { value: color },
      move: {
        enable: true,
        direction: direction,
        speed: { min: minSpeed || speed / 10, max: speed },
        straight: false,
      },
      number: { value: density },
      opacity: {
        value: { min: minOpacity || opacity / 10, max: opacity },
        animation: { enable: true, sync: false, speed: opacitySpeed },
      },
      size: { value: { min: minSize || size / 2.5, max: size } },
    },
    detectRetina: true,
  };

  if (!isReady) return null;

  return (
    <Particles
      id={id}
      options={{ ...defaultOptions, ...options } as any}
      className={cn(className)}
    />
  );
}