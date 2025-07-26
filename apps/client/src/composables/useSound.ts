import { ref, type Ref } from 'vue';

// Define the sound files for different events
const SOUND_FILES = {
  notification: ['/sounds/notification.wav', '/sounds/notification2.wav', '/sounds/notification3.wav'],
  stop: ['/sounds/stop.wav', '/sounds/stop2.wav', '/sounds/stop3.wav']
};

// Type for sound events
export type SoundEvent = keyof typeof SOUND_FILES;

// Composable for sound management
export function useSound() {
  // Reactive state for sound enabled
  const isSoundEnabled = ref(true);
  
  // Load sound enabled state from localStorage
  const loadSoundState = () => {
    const savedState = localStorage.getItem('soundEnabled');
    if (savedState !== null) {
      isSoundEnabled.value = JSON.parse(savedState);
    }
  };
  
  // Save sound enabled state to localStorage
  const saveSoundState = () => {
    localStorage.setItem('soundEnabled', JSON.stringify(isSoundEnabled.value));
  };
  
  // Toggle sound on/off
  const toggleSound = () => {
    isSoundEnabled.value = !isSoundEnabled.value;
    saveSoundState();
  };
  
  // Play a sound file
  const playSoundFile = (file: string) => {
    try {
      const audio = new Audio(file);
      audio.play().catch(error => {
        console.warn(`Failed to play sound ${file}:`, error);
      });
    } catch (error) {
      console.warn(`Error creating audio for ${file}:`, error);
    }
  };
  
  // Play a random sound from a list of options
  const playRandomSound = (files: string[]) => {
    if (files.length > 0) {
      const randomIndex = Math.floor(Math.random() * files.length);
      playSoundFile(files[randomIndex]);
    }
  };
  
  // Play sound for a specific event
  const playSound = (event: SoundEvent) => {
    if (!isSoundEnabled.value) return;
    
    const files = SOUND_FILES[event];
    if (files && files.length > 0) {
      playRandomSound(files);
    }
  };
  
  // Initialize sound state
  loadSoundState();
  
  return {
    isSoundEnabled: isSoundEnabled as Ref<boolean>,
    toggleSound,
    playSound
  };
}
