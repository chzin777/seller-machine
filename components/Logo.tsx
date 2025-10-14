import * as React from "react";
import Image from "next/image";

interface LogoProps {
  type?: 'full' | 'square' | 'text' | 'icon';
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const Logo = ({ 
  type = 'full', 
  width = 120, 
  height = 40, 
  className = "", 
  style = {},
  ...props 
}: LogoProps) => {
  const getLogoSrc = () => {
    switch (type) {
      case 'square':
        return '/images/logo.png';
      case 'text':
        return '/images/logo-texto.png';
      case 'icon':
        return '/images/logo.png';
      case 'full':
      default:
        return '/images/logo-texto.png';
    }
  };

  const getAlt = () => {
    switch (type) {
      case 'square':
        return 'Logo Única Quadrada';
      case 'text':
        return 'Logo Única Texto';
      case 'icon':
        return 'Logo Única Ícone';
      case 'full':
      default:
        return 'Logo Única';
    }
  };

  return (
    <Image
      src={getLogoSrc()}
      alt={getAlt()}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      style={style}
      priority
      {...props}
    />
  );
};

export default Logo;
