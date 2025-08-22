/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import { useRef, useEffect, MouseEvent } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  tiltStrength?: number;
  shadowStrength?: number;
};

export default function TiltedCard({
  children,
  className = "",
  tiltStrength = 15,
  shadowStrength = 20,
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
      
      const rotateX = ((y - centerY) / centerY) * -tiltStrength;
      const rotateY = ((x - centerX) / centerX) * tiltStrength;
      
      const shadowX = ((x - centerX) / centerX) * shadowStrength;
      const shadowY = ((y - centerY) / centerY) * shadowStrength;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      card.style.boxShadow = `${shadowX}px ${shadowY}px ${shadowStrength * 2}px rgba(0, 0, 0, 0.2)`;
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
  }, [tiltStrength, shadowStrength]);

  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-200 ease-out cursor-pointer ${className}`}
      style={{
        transformStyle: "preserve-3d",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      {children}
    </div>
  );
}
