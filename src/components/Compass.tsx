import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass as CompassIcon, Navigation } from 'lucide-react';
import { calculateQibla } from '../services/prayerService';

interface CompassProps {
  coords: { lat: number; lng: number } | null;
}

export const Compass: React.FC<CompassProps> = ({ coords }) => {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (coords) {
      setQiblaDirection(calculateQibla(coords));
    }
  }, [coords]);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // @ts-ignore - webkitCompassHeading is non-standard but widely used on iOS
      const h = event.webkitCompassHeading || (360 - (event.alpha || 0));
      setHeading(h);
    };

    if (window.DeviceOrientationEvent) {
      // Request permission for iOS 13+
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        DeviceOrientationEvent.requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const relativeQibla = (qiblaDirection - heading + 360) % 360;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 rounded-[32px] shadow-inner">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
        
        {/* Compass Dial */}
        <motion.div 
          animate={{ rotate: -heading }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute inset-4 border border-primary/20 rounded-full flex items-center justify-center"
        >
          <div className="absolute top-2 font-bold text-xs text-red-500">N</div>
          <div className="absolute right-2 font-bold text-xs">E</div>
          <div className="absolute bottom-2 font-bold text-xs">S</div>
          <div className="absolute left-2 font-bold text-xs">W</div>
        </motion.div>

        {/* Qibla Pointer */}
        <motion.div 
          animate={{ rotate: relativeQibla }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative h-full w-1 flex flex-col items-center">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center -mt-3 shadow-lg">
              <Navigation className="w-4 h-4 text-white fill-current" />
            </div>
            <div className="flex-1 w-0.5 bg-accent/30" />
          </div>
        </motion.div>

        {/* Center */}
        <div className="w-4 h-4 bg-primary rounded-full z-10 shadow-md" />
      </div>

      <div className="mt-8 text-center">
        <h3 className="serif text-2xl mb-2">Кибла</h3>
        <p className="text-sm opacity-60 mb-4">
          Направление: {Math.round(qiblaDirection)}°
        </p>
        {!isSupported && (
          <p className="text-xs text-red-500 italic">
            Ваше устройство не поддерживает датчик ориентации.
          </p>
        )}
        <p className="text-[10px] uppercase tracking-wider font-bold text-accent">
          Держите телефон горизонтально
        </p>
      </div>
    </div>
  );
};
