import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  title: string;
  description: string;
  arabic: string;
  audioUrl: string;
  imageUrl: string;
}

const PRAYER_STEPS: Step[] = [
  {
    title: 'Намерение (Ният)',
    description: 'Встаньте лицом к Кибле и мысленно выразите намерение совершить конкретный намаз ради Аллаха.',
    arabic: 'نويت أن أصلي...',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3', // Placeholder audio
    imageUrl: 'https://picsum.photos/seed/niyat/400/300'
  },
  {
    title: 'Такбир (Такбируль-ихрам)',
    description: 'Поднимите руки до уровня ушей (мужчины) или плеч (женщины) и произнесите: "Аллаху Акбар".',
    arabic: 'الله أكبر',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    imageUrl: 'https://picsum.photos/seed/takbir/400/300'
  },
  {
    title: 'Кыям (Стояние)',
    description: 'Сложите руки на животе (мужчины) или на груди (женщины) и читайте суру Аль-Фатиха и другую суру.',
    arabic: 'الحمد لله رب العالمين...',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    imageUrl: 'https://picsum.photos/seed/qiyam/400/300'
  },
  {
    title: 'Руку\' (Поясной поклон)',
    description: 'Наклонитесь вперед, положив руки на колени, и произнесите трижды: "Субхана Раббияль-Азым".',
    arabic: 'سبحان ربي العظيم',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    imageUrl: 'https://picsum.photos/seed/ruku/400/300'
  },
  {
    title: 'Суджуд (Земной поклон)',
    description: 'Опуститесь на колени, коснитесь лбом, носом, ладонями и пальцами ног пола. Произнесите трижды: "Субхана Раббияль-Аля".',
    arabic: 'سبحان ربي الأعلى',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    imageUrl: 'https://picsum.photos/seed/sujud/400/300'
  },
  {
    title: 'Салям (Приветствие)',
    description: 'Поверните голову направо, затем налево, произнося: "Ассаляму алейкум ва рахматуллах".',
    arabic: 'السلام عليكم ورحمة الله',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    imageUrl: 'https://picsum.photos/seed/salam/400/300'
  }
];

export const PrayerGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const step = PRAYER_STEPS[currentStep];

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      audioRef.current = new Audio(step.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextStep = () => {
    if (currentStep < PRAYER_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="serif text-3xl">Руководство</h2>
        <span className="text-xs font-bold text-accent uppercase tracking-widest">
          Шаг {currentStep + 1} из {PRAYER_STEPS.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="relative rounded-[24px] overflow-hidden shadow-lg aspect-video bg-primary/5">
            <img 
              src={step.imageUrl} 
              alt={step.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={handlePlayAudio}
              className="absolute bottom-4 right-4 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="serif text-2xl text-primary">{step.title}</h3>
            <p className="text-sm leading-relaxed opacity-70">{step.description}</p>
            
            <div className="p-6 bg-primary/5 rounded-2xl text-center">
              <p className="serif text-3xl text-primary mb-2" dir="rtl">{step.arabic}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-accent/60">Произношение</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button 
          onClick={prevStep}
          disabled={currentStep === 0}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border border-primary/10 transition-all",
            currentStep === 0 ? "opacity-20 pointer-events-none" : "hover:bg-primary/5"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Назад</span>
        </button>
        <button 
          onClick={nextStep}
          disabled={currentStep === PRAYER_STEPS.length - 1}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white transition-all shadow-lg",
            currentStep === PRAYER_STEPS.length - 1 ? "opacity-20 pointer-events-none" : "hover:scale-[1.02]"
          )}
        >
          <span className="text-xs font-bold uppercase tracking-widest">Далее</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
