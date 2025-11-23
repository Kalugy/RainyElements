import React, { useState, useEffect, useRef } from 'react';
import { RainEffect } from '@/components/RainEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sun, Moon, Music, Volume2, VolumeX, Wind, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type WeatherType = 'light' | 'medium' | 'heavy';
type TimeOfDay = 'day' | 'night' | 'dusk';
type Surface = 'glass' | 'metal' | 'tiles' | 'car' | 'leaves' | 'cement';

// Audio sources by surface - each surface has unique rain sounds
const AUDIO_SOURCES: Record<Surface, Record<WeatherType, string>> = {
  glass: {
    light: 'https://www.orangefreesounds.com/wp-content/uploads/2020/03/Rain-on-window-sound.mp3',
    medium: 'https://www.orangefreesounds.com/wp-content/uploads/2020/03/Rain-on-window-sound.mp3',
    heavy: 'https://www.orangefreesounds.com/wp-content/uploads/2020/03/Rain-on-window-sound.mp3'
  },
  metal: {
    light: 'https://orangefreesounds.com/wp-content/uploads/2023/05/Rain-on-metal-roof-sound.mp3',
    medium: 'https://orangefreesounds.com/wp-content/uploads/2023/05/Rain-on-metal-roof-sound.mp3',
    heavy: 'https://orangefreesounds.com/wp-content/uploads/2023/05/Rain-on-metal-roof-sound.mp3'
  },
  tiles: {
    light: 'https://www.orangefreesounds.com/wp-content/uploads/2020/06/Rain-on-roof-sounds.mp3',
    medium: 'https://www.orangefreesounds.com/wp-content/uploads/2020/06/Rain-on-roof-sounds.mp3',
    heavy: 'https://www.orangefreesounds.com/wp-content/uploads/2020/06/Rain-on-roof-sounds.mp3'
  },
  car: {
    light: 'https://www.orangefreesounds.com/wp-content/uploads/2021/07/Raindrops-on-the-car-window-sound-effect.mp3',
    medium: 'https://www.orangefreesounds.com/wp-content/uploads/2021/07/Raindrops-on-the-car-window-sound-effect.mp3',
    heavy: 'https://www.orangefreesounds.com/wp-content/uploads/2021/07/Raindrops-on-the-car-window-sound-effect.mp3'
  },
  leaves: {
    light: 'https://www.orangefreesounds.com/wp-content/uploads/2016/04/Rainforest-sounds.mp3',
    medium: 'https://www.orangefreesounds.com/wp-content/uploads/2016/04/Rainforest-sounds.mp3',
    heavy: 'https://www.orangefreesounds.com/wp-content/uploads/2016/04/Rainforest-sounds.mp3'
  },
  cement: {
    light: 'https://www.orangefreesounds.com/wp-content/uploads/2019/06/Rain-on-concrete.mp3',
    medium: 'https://www.orangefreesounds.com/wp-content/uploads/2019/06/Rain-on-concrete.mp3',
    heavy: 'https://www.orangefreesounds.com/wp-content/uploads/2019/06/Rain-on-concrete.mp3'
  }
};

const THUNDER_SOUND = 'https://orangefreesounds.com/wp-content/uploads/2023/01/Thunder-clap-sound-effect-no-rain.mp3';

export default function RainyPage() {
  const [weatherIntensity, setWeatherIntensity] = useState<WeatherType>('medium');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isThundering, setIsThundering] = useState(false);
  const [enableManualThunder, setEnableManualThunder] = useState(false);
  const [surface, setSurface] = useState<Surface>('glass');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const thunderAudioRef = useRef<HTMLAudioElement | null>(null);

  // Consolidated Audio Logic
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.loop = true;
    
    const targetSrc = AUDIO_SOURCES[surface][weatherIntensity];
    
    // Check if source changed or if we need to start playing
    const needsSrcChange = audio.src !== targetSrc;
    
    if (needsSrcChange) {
      audio.src = targetSrc;
      // If we change source, we usually want to start playing immediately
      // unless muted.
    }

    audio.volume = volume;

    if (isMuted) {
      audio.pause();
    } else {
      // Try to play if not playing or if we just changed source
      if (audio.paused || needsSrcChange) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Playback prevented. User interaction needed.", error);
          });
        }
      }
    }
  }, [weatherIntensity, isMuted, volume, surface]);

  // Adjust volume based on window open state
  useEffect(() => {
      if(windowOpen) {
          setVolume(0.8);
      } else {
          setVolume(0.3); // Muffled sound when window is closed
      }
  }, [windowOpen]);

  // Thunder Effect Logic
  useEffect(() => {
    if (weatherIntensity !== 'heavy') {
      setIsThundering(false);
      return;
    }

    const triggerThunder = () => {
      setIsThundering(true);
      
      // Play Thunder Sound
      if (!isMuted && thunderAudioRef.current) {
          thunderAudioRef.current.currentTime = 0;
          thunderAudioRef.current.volume = windowOpen ? 1.0 : 0.5;
          thunderAudioRef.current.play().catch(e => console.log("Thunder play failed", e));
      }

      setTimeout(() => setIsThundering(false), 1000); // Flash lasts ~1s max in CSS
    };

    const randomInterval = () => {
       // Random time between 5 and 15 seconds for thunder
       const delay = 5000 + Math.random() * 10000;
       return setTimeout(() => {
         triggerThunder();
         timerRef.current = randomInterval();
       }, delay);
    };

    let timerRef = { current: randomInterval() };

    return () => clearTimeout(timerRef.current);
  }, [weatherIntensity, isMuted, windowOpen]);


  // Dynamic background based on time of day
  const getBackground = () => {
    switch (timeOfDay) {
      case 'day': return 'bg-slate-400';
      case 'dusk': return 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900';
      case 'night': return 'bg-gradient-to-b from-slate-950 to-slate-900';
      default: return 'bg-slate-900';
    }
  };

  const handleIntensityChange = (intensity: WeatherType) => {
      setWeatherIntensity(intensity);
      setIsMuted(false);
      
      // Force reload/play immediately for better responsiveness
      if (audioRef.current) {
          const newSrc = AUDIO_SOURCES[surface][intensity];
          if (audioRef.current.src !== newSrc) {
              audioRef.current.src = newSrc;
              audioRef.current.play().catch(e => console.log("Force play failed", e));
          }
      }
  };

  const triggerManualThunder = () => {
      setIsThundering(true);
      
      // Play Thunder Sound
      if (!isMuted && thunderAudioRef.current) {
          thunderAudioRef.current.currentTime = 0;
          thunderAudioRef.current.volume = windowOpen ? 1.0 : 0.5;
          thunderAudioRef.current.play().catch(e => console.log("Thunder play failed", e));
      }

      setTimeout(() => setIsThundering(false), 1000);
  };

  return (
    <div className={`min-h-screen w-full relative transition-colors duration-1000 ${getBackground()} overflow-hidden font-sans text-white`}>
      
      <audio ref={audioRef} />
      <audio ref={thunderAudioRef} src={THUNDER_SOUND} />

      {/* Thunder Overlay */}
      <div 
        className={`absolute inset-0 bg-white pointer-events-none z-[5] mix-blend-overlay ${isThundering ? 'thunder-active' : 'opacity-0'}`}
        aria-hidden="true"
      />

      {/* Rain Layer */}
      <RainEffect intensity={weatherIntensity} />

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        
        {/* Hero Text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center mb-12 pointer-events-none select-none"
        >
          <h1 className="font-serif text-6xl md:text-8xl mb-4 tracking-tight text-white/90 drop-shadow-lg">
            Rainy Days
          </h1>
          <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide">
            Focus. Relax. Breathe.
          </p>
        </motion.div>

        {/* Interactive Window Element */}
        <motion.div
            className="w-full max-w-4xl h-[40vh] mb-12 relative perspective-1000"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
        >
             {/* Window Frame */}
             <div className={`w-full h-full border-8 border-slate-800/50 bg-white/5 backdrop-blur-sm rounded-lg relative overflow-hidden shadow-2xl transition-all duration-700 ${windowOpen ? 'translate-y-[-10px] scale-[1.01]' : ''}`}>
                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                
                {/* Interactive Scene Inside Window */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                        <h3 className="font-serif text-3xl text-white/80 mb-2">
                            {timeOfDay === 'night' ? 'The Midnight Study' : timeOfDay === 'dusk' ? 'Evening Solace' : 'Afternoon Showers'}
                        </h3>
                        <p className="text-white/50 italic">
                            {weatherIntensity === 'heavy' ? 'Heavy storms outside.' : 'A gentle drizzle.'}
                        </p>
                         {weatherIntensity === 'heavy' && (
                             <div className="mt-4 flex items-center justify-center gap-2 text-yellow-200/60 animate-pulse">
                                 <Zap size={16} />
                                 <span className="text-xs uppercase tracking-widest">Thunder Active</span>
                             </div>
                         )}
                    </div>
                </div>
             </div>
        </motion.div>

        {/* Controls Toggle */}
        <motion.div 
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
           <Button 
             variant="ghost" 
             size="icon"
             onClick={() => setShowControls(!showControls)}
             className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md h-12 w-12"
           >
             {showControls ? <CloudRain className="h-5 w-5" /> : <CloudRain className="h-5 w-5 opacity-50" />}
           </Button>
        </motion.div>

        {/* Control Panel */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass-panel p-6 rounded-2xl fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40"
            >
                <div className="space-y-6">
                    
                    {/* Intensity Control */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-white/70 font-medium">
                            <span>Rain Intensity</span>
                            <span className="capitalize">{weatherIntensity}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant={weatherIntensity === 'light' ? "secondary" : "ghost"} 
                                size="sm" 
                                onClick={() => handleIntensityChange('light')}
                                className="flex-1 text-xs"
                            >
                                Light
                            </Button>
                            <Button 
                                variant={weatherIntensity === 'medium' ? "secondary" : "ghost"} 
                                size="sm" 
                                onClick={() => handleIntensityChange('medium')}
                                className="flex-1 text-xs"
                            >
                                Medium
                            </Button>
                            <Button 
                                variant={weatherIntensity === 'heavy' ? "secondary" : "ghost"} 
                                size="sm" 
                                onClick={() => handleIntensityChange('heavy')}
                                className="flex-1 text-xs"
                            >
                                Storm
                            </Button>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Time Control */}
                    <div className="space-y-3">
                        <Label className="text-white/70">Ambience</Label>
                        <div className="flex gap-2 justify-center">
                            <Button
                                variant={timeOfDay === 'day' ? "secondary" : "outline"}
                                size="icon"
                                onClick={() => setTimeOfDay('day')}
                                className="rounded-full border-white/10 hover:bg-white/20"
                            >
                                <Sun className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={timeOfDay === 'dusk' ? "secondary" : "outline"}
                                size="icon"
                                onClick={() => setTimeOfDay('dusk')}
                                className="rounded-full border-white/10 hover:bg-white/20"
                            >
                                <Wind className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={timeOfDay === 'night' ? "secondary" : "outline"}
                                size="icon"
                                onClick={() => setTimeOfDay('night')}
                                className="rounded-full border-white/10 hover:bg-white/20"
                            >
                                <Moon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Surface Selection */}
                    <div className="space-y-3">
                        <Label className="text-white/70">Rain Surface</Label>
                        <Select value={surface} onValueChange={(value) => setSurface(value as Surface)}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="glass">Glass Window</SelectItem>
                                <SelectItem value="metal">Metal Roof</SelectItem>
                                <SelectItem value="tiles">Tile Roof</SelectItem>
                                <SelectItem value="car">Car Roof</SelectItem>
                                <SelectItem value="leaves">Tree Leaves</SelectItem>
                                <SelectItem value="cement">Cement Floor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                     <div className="h-px bg-white/10" />

                    {/* Extra Toggles */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                             {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                             <span className="text-sm">Sound</span>
                        </div>
                        <Switch 
                            checked={!isMuted} 
                            onCheckedChange={(c) => setIsMuted(!c)} 
                            className="data-[state=checked]:bg-white/20"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                             <span className="text-sm">Open Window</span>
                        </div>
                         <Switch 
                            checked={windowOpen} 
                            onCheckedChange={setWindowOpen} 
                            className="data-[state=checked]:bg-white/20"
                        />
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Manual Thunder Control */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white/70">
                                <Zap className="h-4 w-4" />
                                <span className="text-sm">Enable Thunder</span>
                            </div>
                            <Switch 
                                checked={enableManualThunder} 
                                onCheckedChange={setEnableManualThunder} 
                                className="data-[state=checked]:bg-yellow-400/30"
                            />
                        </div>
                        {enableManualThunder && (
                            <Button 
                                onClick={triggerManualThunder}
                                variant="outline" 
                                className="w-full border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/10"
                                data-testid="button-trigger-thunder"
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Trigger Thunder
                            </Button>
                        )}
                    </div>

                </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
