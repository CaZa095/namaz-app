import React, { useState, useEffect, useRef } from 'react';
import { format, differenceInSeconds, subMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Volume2, 
  VolumeX, 
  MapPin, 
  Clock, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Bell, 
  BellOff,
  Moon,
  Sun,
  Sunrise as SunriseIcon,
  Compass as CompassIcon,
  BookOpen,
  Home,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPrayerTimes, PrayerTimeInfo, getNextPrayer } from './services/prayerService';
import { cn } from './lib/utils';
import { Compass } from './components/Compass';
import { PrayerGuide } from './components/PrayerGuide';
import { POPULAR_CITIES, City } from './constants/cities';

const AZAN_AUDIO_URL = 'https://www.islamcan.com/audio/adhan/azan1.mp3';

type View = 'main' | 'compass' | 'guide' | 'settings';

export default function App() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [prayers, setPrayers] = useState<PrayerTimeInfo[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTimeInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAzanEnabled, setIsAzanEnabled] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState<View>('main');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | 'auto'>(() => {
    const saved = localStorage.getItem('selectedCity');
    if (saved === 'auto' || !saved) return 'auto';
    try {
      return JSON.parse(saved);
    } catch {
      return 'auto';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedPrayers = useRef<Set<string>>(new Set());

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(AZAN_AUDIO_URL);
    audioRef.current.onended = () => setIsPlaying(false);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            setNotificationsEnabled(true);
          }
        });
      }
    }
  }, []);

  // Get Location or Use Selected City
  useEffect(() => {
    if (selectedCity === 'auto') {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationError(null);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationError("Не удалось получить местоположение. Используются настройки по умолчанию (Мекка).");
            setCoords({ lat: 21.4225, lng: 39.8262 });
          }
        );
      } else {
        setLocationError("Геолокация не поддерживается вашим браузером.");
        setCoords({ lat: 21.4225, lng: 39.8262 });
      }
    } else {
      setCoords({ lat: selectedCity.lat, lng: selectedCity.lng });
      setLocationError(null);
    }
  }, [selectedCity]);

  // Save selection to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCity', selectedCity === 'auto' ? 'auto' : JSON.stringify(selectedCity));
  }, [selectedCity]);

  // Calculate Prayer Times
  useEffect(() => {
    if (coords) {
      const times = getPrayerTimes(coords);
      setPrayers(times);
      setNextPrayer(getNextPrayer(times));
    }
  }, [coords]);

  // Clock, Azan Trigger, and Notifications
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const prevMinute = currentTime.getMinutes();
      const currentMinute = now.getMinutes();
      
      setCurrentTime(now);
      
      if (coords && (currentMinute !== prevMinute || prayers.length === 0)) {
        const times = getPrayerTimes(coords, now);
        setPrayers(times);
        setNextPrayer(getNextPrayer(times));
      }

      // Check for Azan
      if (isAzanEnabled && !isPlaying) {
        const currentPrayer = prayers.find(p => 
          p.id !== 'sunrise' && 
          Math.abs(differenceInSeconds(p.time, now)) < 1
        );
        
        if (currentPrayer) {
          playAzan();
        }
      }

      // Check for Pre-Azan Notification (5 minutes before)
      if (notificationsEnabled) {
        prayers.forEach(prayer => {
          if (prayer.id === 'sunrise') return;
          
          const notifyTime = subMinutes(prayer.time, 5);
          const diff = differenceInSeconds(notifyTime, now);
          const prayerKey = `${prayer.id}-${prayer.time.toDateString()}`;

          if (Math.abs(diff) < 2 && !notifiedPrayers.current.has(prayerKey)) {
            new Notification("Напоминание о намазе", {
              body: `До начала намаза ${prayer.name} осталось 5 минут.`,
              icon: "/favicon.ico"
            });
            notifiedPrayers.current.add(prayerKey);
          }
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [coords, prayers, isAzanEnabled, isPlaying, currentTime, notificationsEnabled]);

  const playAzan = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      setIsPlaying(true);
    }
  };

  const stopAzan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const getPrayerIcon = (id: string) => {
    switch (id) {
      case 'fajr': return <Moon className="w-5 h-5" />;
      case 'sunrise': return <SunriseIcon className="w-5 h-5 text-orange-400" />;
      case 'dhuhr': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'asr': return <Sun className="w-5 h-5 text-orange-500" />;
      case 'maghrib': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'isha': return <Moon className="w-5 h-5 text-indigo-900" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatCountdown = (target: Date) => {
    const diff = differenceInSeconds(target, currentTime);
    if (diff < 0) return '00:00:00';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredCities = POPULAR_CITIES.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen max-w-md mx-auto bg-bg-warm flex flex-col shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="p-8 pt-12 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 flex items-center gap-2 text-accent uppercase tracking-widest text-xs font-bold"
        >
          <MapPin className="w-3 h-3" />
          {selectedCity === 'auto' ? (
            coords ? `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)} (Авто)` : 'Определение...'
          ) : (
            `${selectedCity.name}, ${selectedCity.country}`
          )}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="serif text-5xl font-light mb-4 text-primary"
        >
          {format(currentTime, 'HH:mm:ss')}
        </motion.h1>
        
        <p className="text-sm opacity-60 font-medium">
          {format(currentTime, 'EEEE, d MMMM', { locale: ru })}
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentView === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {nextPrayer ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary text-white rounded-[32px] p-8 relative overflow-hidden shadow-xl"
                >
                  <div className="relative z-10">
                    <p className="text-accent uppercase tracking-[0.2em] text-xs font-bold mb-2">Следующий намаз</p>
                    <h2 className="serif text-4xl mb-6">{nextPrayer.name}</h2>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs opacity-60 mb-1">Время</p>
                        <p className="text-2xl font-light">{format(nextPrayer.time, 'HH:mm')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-60 mb-1">Осталось</p>
                        <p className="text-2xl font-mono font-light tracking-tighter">
                          {formatCountdown(nextPrayer.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    <Moon className="w-48 h-48" />
                  </div>
                </motion.div>
              ) : (
                <div className="h-48 flex items-center justify-center text-primary/40 italic">
                  Загрузка времени...
                </div>
              )}

              <div className="space-y-3">
                {prayers.map((prayer, index) => {
                  const isNext = nextPrayer?.id === prayer.id;
                  const isPassed = prayer.time < currentTime;
                  
                  return (
                    <motion.div
                      key={prayer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-2xl transition-all duration-300",
                        isNext ? "bg-accent/10 border border-accent/20" : "bg-white/50",
                        isPassed && !isNext && "opacity-40"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isNext ? "bg-accent text-white" : "bg-primary/5 text-primary/60"
                        )}>
                          {getPrayerIcon(prayer.id)}
                        </div>
                        <div>
                          <p className={cn("font-medium", isNext && "text-accent")}>{prayer.name}</p>
                          {isNext && <p className="text-[10px] uppercase tracking-wider font-bold text-accent/60">Сейчас</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-light">{format(prayer.time, 'HH:mm')}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentView === 'compass' && (
            <motion.div
              key="compass"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col justify-center"
            >
              <Compass coords={coords} />
            </motion.div>
          )}

          {currentView === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <PrayerGuide />
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="serif text-3xl">Настройки</h2>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Местоположение</h3>
                  
                  <button 
                    onClick={() => setSelectedCity('auto')}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl mb-4 transition-all",
                      selectedCity === 'auto' ? "bg-primary text-white shadow-lg" : "bg-white/50 border border-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">Автоматически (GPS)</span>
                    </div>
                    {selectedCity === 'auto' && <Check className="w-5 h-5" />}
                  </button>

                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input 
                      type="text"
                      placeholder="Поиск города..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/50 border border-primary/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCities.map(city => (
                      <button 
                        key={`${city.name}-${city.country}`}
                        onClick={() => setSelectedCity(city)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                          selectedCity !== 'auto' && selectedCity.name === city.name ? "bg-accent text-white shadow-lg" : "bg-white/50 border border-primary/5"
                        )}
                      >
                        <div className="text-left">
                          <p className="font-medium">{city.name}</p>
                          <p className="text-[10px] opacity-60 uppercase tracking-wider">{city.country}</p>
                        </div>
                        {selectedCity !== 'auto' && selectedCity.name === city.name && <Check className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Уведомления</h3>
                  <div className="bg-white/50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-primary/60" />
                      <span className="text-sm font-medium">Напоминание за 5 мин.</span>
                    </div>
                    <button 
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        notificationsEnabled ? "bg-accent" : "bg-primary/10"
                      )}
                    >
                      <motion.div 
                        animate={{ x: notificationsEnabled ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="p-4 bg-white/90 backdrop-blur-lg border-t border-primary/5 flex items-center justify-around">
        <button 
          onClick={() => setCurrentView('main')}
          className={cn(
            "p-4 rounded-2xl transition-all",
            currentView === 'main' ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:text-primary"
          )}
        >
          <Home className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentView('compass')}
          className={cn(
            "p-4 rounded-2xl transition-all",
            currentView === 'compass' ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:text-primary"
          )}
        >
          <CompassIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentView('guide')}
          className={cn(
            "p-4 rounded-2xl transition-all",
            currentView === 'guide' ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:text-primary"
          )}
        >
          <BookOpen className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentView('settings')}
          className={cn(
            "p-4 rounded-2xl transition-all",
            currentView === 'settings' ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:text-primary"
          )}
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </nav>

      {/* Controls Overlay */}
      <div className="px-6 py-4 flex items-center justify-between bg-white/50 border-t border-primary/5">
        <button 
          onClick={() => setIsAzanEnabled(!isAzanEnabled)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full transition-all text-[10px] font-bold uppercase tracking-wider",
            isAzanEnabled ? "bg-primary text-white" : "bg-primary/5 text-primary/60"
          )}
        >
          {isAzanEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
          {isAzanEnabled ? 'Азан' : 'Без звука'}
        </button>

        {isPlaying && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={stopAzan}
            className="bg-red-500 text-white p-2 rounded-full shadow-lg"
          >
            <VolumeX className="w-4 h-4" />
          </motion.button>
        )}

        <div className="text-[10px] font-bold uppercase tracking-wider text-primary/40">
          v1.1.0
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
