interface HuntXLogoProps {
  variant?: 'primary' | 'dark' | 'orange-bg' | 'horizontal' | 'stacked' | 'icon';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function HuntXLogo({ variant = 'primary', size = 'medium', className = '' }: HuntXLogoProps) {
  const sizes = {
    small: { 
      icon: 32,
      text: 'text-xl',
      gap: 'gap-2'
    },
    medium: { 
      icon: 48,
      text: 'text-3xl',
      gap: 'gap-3'
    },
    large: { 
      icon: 80,
      text: 'text-5xl',
      gap: 'gap-4'
    }
  };

  const iconSize = sizes[size].icon;

  // Icon SVG
  const IconMark = () => (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" stroke="#FF6B00" strokeWidth="4"/>
      
      {/* Dynamic X with arrow points */}
      <path 
        d="M25 25 L45 45 M55 45 L75 25 M25 75 L45 55 M55 55 L75 75" 
        stroke="#000000" 
        strokeWidth="6" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrow tips on X */}
      <path d="M75 25 L70 30 L75 30 Z" fill="#FF6B00"/>
      <path d="M25 25 L30 25 L30 30 Z" fill="#FF6B00"/>
      <path d="M75 75 L75 70 L70 70 Z" fill="#FF6B00"/>
      <path d="M25 75 L25 70 L30 70 Z" fill="#FF6B00"/>
      
      {/* Center crosshair */}
      <circle cx="50" cy="50" r="8" fill="none" stroke="#FF6B00" strokeWidth="2"/>
      <circle cx="50" cy="50" r="3" fill="#FF6B00"/>
      
      {/* Cardinal direction marks */}
      <line x1="50" y1="8" x2="50" y2="15" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round"/>
      <line x1="50" y1="85" x2="50" y2="92" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round"/>
      <line x1="8" y1="50" x2="15" y2="50" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round"/>
      <line x1="85" y1="50" x2="92" y2="50" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div className={className}>
        <IconMark />
      </div>
    );
  }

  // Dark background version
  if (variant === 'dark') {
    return (
      <div className={`flex items-center ${sizes[size].gap} ${className}`}>
        <div style={{ filter: 'invert(1)' }}>
          <IconMark />
        </div>
        <div className={`${sizes[size].text} tracking-tight`} style={{ fontWeight: 800 }}>
          <span className="text-white">HUNT</span>
          <span className="text-orange-500">X</span>
        </div>
      </div>
    );
  }

  // Orange background version
  if (variant === 'orange-bg') {
    return (
      <div className={`flex items-center ${sizes[size].gap} ${className}`}>
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="48" stroke="#FFFFFF" strokeWidth="4"/>
          <path 
            d="M25 25 L45 45 M55 45 L75 25 M25 75 L45 55 M55 55 L75 75" 
            stroke="#000000" 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M75 25 L70 30 L75 30 Z" fill="#FFFFFF"/>
          <path d="M25 25 L30 25 L30 30 Z" fill="#FFFFFF"/>
          <path d="M75 75 L75 70 L70 70 Z" fill="#FFFFFF"/>
          <path d="M25 75 L25 70 L30 70 Z" fill="#FFFFFF"/>
          <circle cx="50" cy="50" r="8" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
          <circle cx="50" cy="50" r="3" fill="#FFFFFF"/>
          <line x1="50" y1="8" x2="50" y2="15" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="85" x2="50" y2="92" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
          <line x1="8" y1="50" x2="15" y2="50" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
          <line x1="85" y1="50" x2="92" y2="50" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <div className={`${sizes[size].text} tracking-tight`} style={{ fontWeight: 800 }}>
          <span className="text-black">HUNT</span>
          <span className="text-white">X</span>
        </div>
      </div>
    );
  }

  // Stacked variant
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <IconMark />
        <div className={`${sizes[size].text} tracking-tight text-center`} style={{ fontWeight: 800 }}>
          <span className="text-black">HUNT</span>
          <span className="text-orange-600">X</span>
        </div>
      </div>
    );
  }

  // Primary and horizontal variants
  return (
    <div className={`flex items-center ${sizes[size].gap} ${className}`}>
      <IconMark />
      <div className={`${sizes[size].text} tracking-tight`} style={{ fontWeight: 800 }}>
        <span className="text-black">HUNT</span>
        <span className="text-orange-600">X</span>
      </div>
    </div>
  );
}