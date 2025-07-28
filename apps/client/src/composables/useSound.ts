import { ref, type Ref } from 'vue';

// Define the sound files for different events
const SOUND_FILES = {
  notification: ['/sounds/notification.wav', '/sounds/notification2.wav', '/sounds/notification3.wav', '/sounds/notification4.wav', '/sounds/notification5.wav', '/sounds/notification6.wav'],
  stop: ['/sounds/stop.wav', '/sounds/stop2.wav', '/sounds/stop3.wav', '/sounds/stop4.wav', '/sounds/stop5.wav', '/sounds/stop6.wav']
};

// Type for sound events
export type SoundEvent = keyof typeof SOUND_FILES;

// Global reactive state (shared across all instances)
const isSoundEnabled = ref(true);
const hasUserInteracted = ref(false);

// Composable for sound management
export function useSound() {
  
  // Load sound enabled state from localStorage
  const loadSoundState = () => {
    const savedState = localStorage.getItem('soundEnabled');
    if (savedState !== null) {
      isSoundEnabled.value = JSON.parse(savedState);
    }
    
    // Check if user has previously interacted
    const interactionState = localStorage.getItem('userHasInteracted');
    if (interactionState !== null) {
      hasUserInteracted.value = JSON.parse(interactionState);
    }
  };
  
  // Save sound enabled state to localStorage
  const saveSoundState = () => {
    localStorage.setItem('soundEnabled', JSON.stringify(isSoundEnabled.value));
  };
  
  // Save user interaction state to localStorage
  const saveInteractionState = () => {
    localStorage.setItem('userHasInteracted', JSON.stringify(hasUserInteracted.value));
  };
  
  // Mark that user has interacted (call this after any user action)
  const markUserInteracted = () => {
    hasUserInteracted.value = true;
    saveInteractionState();
    // Pre-load a silent audio to establish audio context for background playback
    try {
      const silentAudio = new Audio();
      silentAudio.volume = 0.01;
      silentAudio.play().catch(() => {});
    } catch (error) {
      // Ignore errors for silent audio
    }
  };
  
  // Toggle sound on/off
  const toggleSound = () => {
    isSoundEnabled.value = !isSoundEnabled.value;
    saveSoundState();
  };
  
  // Play a sound file
  const playSoundFile = (file: string) => {
    // Don't attempt to play if user hasn't interacted yet
    if (!hasUserInteracted.value) {
      console.log('Skipping sound playback - user has not interacted with page yet');
      return;
    }
    
    try {
      const audio = new Audio(file);
      // Set volume to ensure it plays even in background
      audio.volume = 0.7;
      // Force play even if tab is not focused
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
    hasUserInteracted: hasUserInteracted as Ref<boolean>,
    toggleSound,
    playSound,
    markUserInteracted
  };
}
