import React, { useState, useEffect, useRef } from 'react';
import { RainEffect } from '@/components/RainEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sun, Moon, Music, Volume2, VolumeX, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type WeatherType = 'light' | 'medium' | 'heavy';
type TimeOfDay = 'day' | 'night' | 'dusk';

// Audio sources
const AUDIO_SOURCES = {
  light: 'https://www.orangefreesounds.com/wp-content/uploads/2018/04/Gentle-rain-loop.mp3',
  medium: 'https://www.orangefreesounds.com/wp-content/uploads/2015/01/Rain-sound-loop.mp3',
  heavy: 'https://www.orangefreesounds.com/wp-content/uploads/2015/09/Heavy-rain-sound-effect.mp3'
};

export default function RainyPage() {
  const [weatherIntensity, setWeatherIntensity] = useState<WeatherType>('medium');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Audio Playback
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.loop = true;
    
    // Update source if it's different
    // Note: We are checking currentSrc to avoid reloading if it's the same
    // but src property might be absolute URL, so we just set it if needed.
    // For simplicity in this prototype, we just set it.
    const newSrc = AUDIO_SOURCES[weatherIntensity];
    if (audio.src !== newSrc) {
       const wasPlaying = !audio.paused;
       audio.src = newSrc;
       audio.volume = volume; // Reset volume just in case
       if (wasPlaying && !isMuted) {
         audio.play().catch(e => console.log("Audio play failed:", e));
       }
    }
  }, [weatherIntensity]);

  // Handle Mute/Play/Volume
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isMuted) {
      audio.pause();
    } else {
      // Only try to play if we have a source and user likely interacted
      audio.volume = volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented
          console.log("Playback prevented. User interaction needed.");
        });
      }
    }
  }, [isMuted, volume]);

  // Adjust volume based on window open state
  useEffect(() => {
      if(windowOpen) {
          setVolume(0.8);
      } else {
          setVolume(0.3); // Muffled sound when window is closed
      }
  }, [windowOpen]);


  // Dynamic background based on time of day
  const getBackground = () => {
    switch (timeOfDay) {
      case 'day': return 'bg-slate-400';
      case 'dusk': return 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900';
      case 'night': return 'bg-gradient-to-b from-slate-950 to-slate-900';
      default: return 'bg-slate-900';
    }
  };

  return (
    <div className={`min-h-screen w-full relative transition-colors duration-1000 ${getBackground()} overflow-hidden font-sans text-white`}>
      
      <audio ref={audioRef} src={AUDIO_SOURCES[weatherIntensity]} />

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
                                onClick={() => {
                                    setWeatherIntensity('light');
                                    setIsMuted(false);
                                }}
                                className="flex-1 text-xs"
                            >
                                Light
                            </Button>
                            <Button 
                                variant={weatherIntensity === 'medium' ? "secondary" : "ghost"} 
                                size="sm" 
                                onClick={() => {
                                    setWeatherIntensity('medium');
                                    setIsMuted(false);
                                }}
                                className="flex-1 text-xs"
                            >
                                Medium
                            </Button>
                            <Button 
                                variant={weatherIntensity === 'heavy' ? "secondary" : "ghost"} 
                                size="sm" 
                                onClick={() => {
                                    setWeatherIntensity('heavy');
                                    setIsMuted(false);
                                }}
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

                </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
