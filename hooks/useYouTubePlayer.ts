
import { useState, useEffect, useRef } from 'react';

interface YouTubePlayerOptions {
  videoId: string;
  containerId: string;
  onTimeUpdate?: (time: number) => void;
  onError?: (error: string) => void;
}

export const useYouTubePlayer = ({ videoId, containerId, onTimeUpdate, onError }: YouTubePlayerOptions) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const timeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const loadScript = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        (window as any).onYouTubeIframeAPIReady = () => {
          initPlayer();
        };
      } else {
        initPlayer();
      }
    };

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      try {
        playerRef.current = new (window as any).YT.Player(containerId, {
          videoId: videoId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            'playsinline': 1,
            'rel': 0,
            'modestbranding': 1,
            'origin': window.location.origin
          },
          events: {
            'onStateChange': (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                startTimeTracking();
              } else {
                stopTimeTracking();
              }
            },
            'onError': (event: any) => {
              console.error("YouTube Player Error Code:", event.data);
              const errorMsg = "Video restricted (Error 150/101/153)";
              setError(errorMsg);
              if (onError) onError(errorMsg);
            }
          }
        });
      } catch (e) {
        console.error("Failed to init YT player", e);
        const errorMsg = "Player initialization failed.";
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    };

    const startTimeTracking = () => {
      stopTimeTracking();
      timeIntervalRef.current = window.setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          if (onTimeUpdate) onTimeUpdate(time);
        }
      }, 250);
    };

    const stopTimeTracking = () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    };

    loadScript();

    return () => {
      stopTimeTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, containerId]);

  return { currentTime, error, player: playerRef.current };
};
