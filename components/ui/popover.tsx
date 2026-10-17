"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className = "", align = "center", sideOffset = 6, ...props }: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        data-lenis-prevent
        className={`z-[200] max-w-[calc(100vw-24px)] shadow-[0_18px_50px_-18px_rgba(26,20,16,0.45)] outline-none ${className}`}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
