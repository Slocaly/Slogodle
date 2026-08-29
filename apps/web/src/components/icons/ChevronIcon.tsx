import type { SVGProps } from "react";

interface ChevronIconProps extends SVGProps<SVGSVGElement> {
  direction?: "left" | "right";
}

export function ChevronIcon({ direction = "right", style, ...props }: ChevronIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)", ...style } : style}
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
