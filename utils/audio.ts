/**
 * AudioManager utility for caching and playing interface sounds with low latency.
 */
class AudioManager {
  private static cache: Record<string, HTMLAudioElement> = {};

  /**
   * Preload an audio file to avoid latency on first interaction.
   */
  static preload(src: string) {
    if (typeof window === "undefined") return;
    if (!this.cache[src]) {
      const audio = new Audio(src);
      audio.preload = "auto";
      this.cache[src] = audio;
    }
  }

  /**
   * Play an audio file. Clones the cached Audio node to support overlapping low-latency play.
   */
  static play(src: string, volume = 0.5) {
    if (typeof window === "undefined") return;
    try {
      let audio = this.cache[src];
      if (!audio) {
        audio = new Audio(src);
        audio.preload = "auto";
        this.cache[src] = audio;
      }
      
      // Clone the preloaded node to play instantly and allow overlapping sounds
      const clone = audio.cloneNode(true) as HTMLAudioElement;
      clone.volume = volume;

      const playPromise = clone.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Play was prevented, usually because of autoplay policy.
        });
      }
    } catch (error) {
      console.warn(`[AudioManager] Failed to play audio: ${src}`, error);
    }
  }
}

export const playSound = {
  menuOpen: () => AudioManager.play("/audio/menu open close.wav", 0.4),
  menuHover: () => AudioManager.play("/audio/menu items and projects.wav", 0.25),
  projectHover: () => AudioManager.play("/audio/menu items and projects.wav", 0.25),
  themeToggle: () => AudioManager.play("/audio/theme toggle.wav", 0.45),
  skillsClick: () => AudioManager.play("/audio/menu open close.wav", 0.35),
  skillsSwap: () => AudioManager.play("/audio/menu items and projects.wav", 0.3),
  preloadAll: () => {
    AudioManager.preload("/audio/menu open close.wav");
    AudioManager.preload("/audio/menu items and projects.wav");
    AudioManager.preload("/audio/theme toggle.wav");
  }
};
