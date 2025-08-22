import { useEffect, useState } from "react";

type Props = {
  className?: string;
  speed?: number;
  hueShift?: number;
  noiseIntensity?: number;
};

export default function SimpleDarkVeil({ 
  className = "", 
  speed = 1, 
  hueShift = 20,
  noiseIntensity = 0.05 
}: Props) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const updateTime = () => {
      setTime((Date.now() - startTime) / 1000 * speed);
      requestAnimationFrame(updateTime);
    };
    updateTime();
  }, [speed]);

  const gradientStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -20,
    pointerEvents: 'none' as const,
    background: `
      radial-gradient(
        ellipse at ${50 + Math.sin(time * 0.3) * 20}% ${50 + Math.cos(time * 0.4) * 20}%, 
        hsla(${220 + hueShift + Math.sin(time * 0.2) * 30}, 70%, 15%, 0.9) 0%, 
        hsla(${240 + hueShift + Math.cos(time * 0.3) * 20}, 80%, 10%, 0.7) 25%,
        hsla(${200 + hueShift + Math.sin(time * 0.1) * 40}, 60%, 20%, 0.5) 50%,
        hsla(${260 + hueShift + Math.cos(time * 0.2) * 25}, 75%, 8%, 0.8) 75%,
        hsla(${210 + hueShift + Math.sin(time * 0.4) * 35}, 65%, 12%, 0.9) 100%
      ),
      linear-gradient(
        ${45 + Math.sin(time * 0.15) * 90}deg, 
        hsla(${180 + hueShift}, 50%, 5%, 0.3) 0%, 
        hsla(${220 + hueShift}, 70%, 8%, 0.5) 25%,
        hsla(${280 + hueShift}, 60%, 6%, 0.4) 50%,
        hsla(${200 + hueShift}, 80%, 10%, 0.6) 75%,
        hsla(${240 + hueShift}, 55%, 7%, 0.3) 100%
      ),
      conic-gradient(
        from ${time * 20}deg at ${50 + Math.sin(time * 0.25) * 30}% ${50 + Math.cos(time * 0.35) * 30}%,
        hsla(${hueShift + 200}, 40%, 8%, 0.2),
        hsla(${hueShift + 250}, 60%, 12%, 0.3),
        hsla(${hueShift + 300}, 50%, 6%, 0.2),
        hsla(${hueShift + 220}, 70%, 10%, 0.4),
        hsla(${hueShift + 200}, 40%, 8%, 0.2)
      )
    `,
    filter: `
      brightness(${0.7 + Math.sin(time * 0.5) * 0.1}) 
      contrast(${1.1 + Math.sin(time * 0.3) * 0.1})
      hue-rotate(${Math.sin(time * 0.1) * 10}deg)
    `,
    opacity: 0.95 + Math.sin(time * 0.8) * 0.05,
    transform: `scale(${1.05 + Math.sin(time * 0.2) * 0.02})`,
    transition: 'filter 0.5s ease-out, opacity 0.5s ease-out'
  };

  // Padrão de ruído simulado com CSS
  const noiseOverlay = noiseIntensity > 0 ? {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 1px,
        rgba(255,255,255,${noiseIntensity * 0.5}) 1px,
        rgba(255,255,255,${noiseIntensity * 0.5}) 2px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 1px,
        rgba(0,0,0,${noiseIntensity * 0.3}) 1px,
        rgba(0,0,0,${noiseIntensity * 0.3}) 2px
      )
    `,
    mixBlendMode: 'overlay' as const,
    opacity: 0.3 + Math.sin(time * 2) * 0.1
  } : {};

  return (
    <div className={`${className}`} style={gradientStyle}>
      {noiseIntensity > 0 && <div style={noiseOverlay} />}
    </div>
  );
}
