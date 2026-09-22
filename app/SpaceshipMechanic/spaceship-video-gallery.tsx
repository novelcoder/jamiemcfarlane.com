'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';

import styles from './spaceship-mechanic.module.css';

type Video = {
  id: string;
  title: string;
  label: string;
};

export function SpaceshipVideoGallery({
  videos,
}: {
  videos: readonly Video[];
}) {
  const [activeId, setActiveId] = useState(videos[0]?.id);
  const activeVideo = videos.find((video) => video.id === activeId);

  if (!activeVideo) return null;

  return (
    <div className={styles.videoGrid}>
      <div className={styles.videoFrame}>
        <iframe
          key={activeVideo.id}
          src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?rel=0`}
          title={activeVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <div className={styles.videoList}>
        {videos.map((video) => {
          const isActive = video.id === activeVideo.id;

          return (
            <button
              className={`${styles.videoChoice} ${isActive ? styles.videoChoiceActive : ''}`}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveId(video.id)}
              key={video.id}
            >
              <span className={styles.playButton} aria-hidden="true">
                <Play />
              </span>
              <span>
                <small>{video.label}</small>
                <strong>{video.title}</strong>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
