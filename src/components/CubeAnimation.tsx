// components/CubeAnimation.tsx
import React from 'react';

interface CubeAnimationProps {
  items: {
    icon: string;
    title: string;
    description: string;
  }[];
  theme?: 'primary' | 'secondary';
}

const CubeAnimation: React.FC<CubeAnimationProps> = ({ 
  items, 
  theme = 'primary' 
}) => {
  const gradientColors = {
    primary: 'from-purple-500 to-pink-500',
    secondary: 'from-blue-500 to-cyan-500'
  };

  return (
    <div className="relative w-full h-64 md:h-80 flex items-center justify-center perspective-1000">
      {/* Main Cube */}
      <div className="cube w-32 h-32 md:w-40 md:h-40 relative transform-style-preserve-3d animate-rotate-cube">
        {/* Front face */}
        <div className={`absolute w-full h-full bg-gradient-to-br ${gradientColors[theme]} opacity-90 border border-white/30 rounded-xl backdrop-blur-sm flex items-center justify-center transform translate-z-20`}>
          <div className="text-white text-2xl md:text-3xl">
            <i className={items[0]?.icon || "fas fa-cube"}></i>
          </div>
        </div>
        
        {/* Back face */}
        <div className={`absolute w-full h-full bg-gradient-to-br ${gradientColors[theme]} opacity-90 border border-white/30 rounded-xl backdrop-blur-sm flex items-center justify-center transform rotate-y-180 translate-z-20`}>
          <div className="text-white text-2xl md:text-3xl">
            <i className={items[1]?.icon || "fas fa-cube"}></i>
          </div>
        </div>
        
        {/* Right face */}
        <div className={`absolute w-full h-full bg-gradient-to-br ${gradientColors[theme]} opacity-90 border border-white/30 rounded-xl backdrop-blur-sm flex items-center justify-center transform rotate-y-90 translate-z-20`}>
          <div className="text-white text-2xl md:text-3xl">
            <i className={items[2]?.icon || "fas fa-cube"}></i>
          </div>
        </div>
        
        {/* Left face */}
        <div className={`absolute w-full h-full bg-gradient-to-br ${gradientColors[theme]} opacity-90 border border-white/30 rounded-xl backdrop-blur-sm flex items-center justify-center transform rotate-y-270 translate-z-20`}>
          <div className="text-white text-2xl md:text-3xl">
            <i className={items[3]?.icon || "fas fa-cube"}></i>
          </div>
        </div>
        
        {/* Top face */}
        <div className={`absolute w-full h-full bg-gradient-to-br ${gradientColors[theme]} opacity-90 border border-white/30 rounded-xl backdrop-blur-sm flex items-center justify-center transform rotate-x-90 translate-z-20`}>
          <div className="text-white text-2xl md:text-3xl">
            <i className={items[4]?.icon || "fas fa-cube"}></i>
          </div>
        </div>
        
        {/* Bottom face */}
        <div className={`absolute w-full h-full bg-gradient-to-br ${gradientColors[theme]} opacity-90 border border-white/30 rounded-xl backdrop-blur-sm flex items-center justify-center transform rotate-x-270 translate-z-20`}>
          <div className="text-white text-2xl md:text-3xl">
            <i className={items[5]?.icon || "fas fa-cube"}></i>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      {items.slice(0, 3).map((item, index) => (
        <div 
          key={index}
          className={`absolute bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl ${
            index === 0 ? 'animate-float-1' : 
            index === 1 ? 'animate-float-2' : 'animate-float-3'
          }`}
          style={{
            width: `${120 - index * 20}px`,
            height: `${120 - index * 20}px`,
            top: index === 0 ? '20px' : index === 1 ? 'auto' : '100px',
            bottom: index === 1 ? '40px' : 'auto',
            right: index === 0 ? '30px' : index === 1 ? '100px' : 'auto',
            left: index === 2 ? '40px' : 'auto',
          }}
        >
          <div className="text-blue-400 text-lg mb-2">
            <i className={item.icon}></i>
          </div>
          <div className="text-white text-sm font-medium">{item.title}</div>
        </div>
      ))}
    </div>
  );
};

export default CubeAnimation;