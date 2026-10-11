import { useEffect, useRef } from "react";
import type { VideoConfig } from "../config/types";

interface Props {
  video: VideoConfig;
  open: boolean;
  onClose: () => void;
}

/** Modal video player on a native <dialog> (focus trap, Escape and inert page built in). */
export function VideoDialog({ video, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("is-locked");
      videoRef.current?.play().catch(() => {
        /* autoplay refused: controls remain available */
      });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="video-dialog"
      aria-labelledby="video-dialog-title"
      onClose={() => {
        videoRef.current?.pause();
        document.documentElement.classList.remove("is-locked");
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="video-dialog__frame">
        <div className="video-dialog__bar">
          <h2 id="video-dialog-title" className="video-dialog__title">{video.title}</h2>
          <button type="button" className="video-dialog__close" onClick={onClose}>
            <span className="visually-hidden">Close video</span>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 4l12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <video ref={videoRef} className="video-dialog__video" src={open ? video.src : undefined} poster={video.poster} controls playsInline preload="none" />
      </div>
    </dialog>
  );
}
