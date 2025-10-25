/*
	Generic Tilted Card Component - Adapted for any content
*/

import { useRef, useEffect } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  tiltStrength?: number;
  shadowStrength?: number;
  scaleOnHover?: number;
};

export default function GenericTiltedCard({
  children,
  className = "",
  tiltStrength = 15,
  shadowStrength = 20,
  scaleOnHover = 1.02,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -(tiltStrength * 0.7);
      const rotateY = ((x - centerX) / centerX) * (tiltStrength * 0.7);
      
      const shadowX = ((x - centerX) / centerX) * (shadowStrength * 0.5);
      const shadowY = ((y - centerY) / centerY) * (shadowStrength * 0.5);
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleOnHover * 0.98}, ${scaleOnHover * 0.98}, ${scaleOnHover * 0.98})`;
      card.style.boxShadow = `${shadowX}px ${shadowY}px ${shadowStrength}px rgba(0, 0, 0, 0.2)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      card.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [tiltStrength, shadowStrength, scaleOnHover]);

  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-200 ease-out cursor-pointer w-full h-full min-w-0 rounded-xl ${className}`}
      style={{
        transformStyle: "preserve-3d",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        maxWidth: "100%",
        width: "100%",
        height: "100%",
        borderRadius: "0.75rem",
        position: "relative",
        zIndex: 1,
        margin: "0",
        padding: "0",
        border: "none",
        outline: "none",
        transformOrigin: "center center",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box"
      }}
    >
      {children}
    </div>
  );
}
