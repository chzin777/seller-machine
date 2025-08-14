import * as React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width={props.width || 256}
    height={props.height || 256}
    fill="none"
    {...props}
  >
    <g
      stroke="currentColor"
      strokeWidth={12}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="92" cy="206" r="14" />
      <circle cx="168" cy="206" r="14" />
      <path d="M36 66 H64" />
      <path d="M64 66 L84 160 H188 L210 104 H80 Z" />
      <path d="M96 132 L132 108 L156 122 L202 84" />
      <path d="M202 84 V58" />
      <path d="M190 66 L202 54 L214 66" />
    </g>
  </svg>
);

export default Logo;
