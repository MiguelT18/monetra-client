"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { getVideoToken } from "@/lib/enrollment-api";
import { getLessonHlsUrl } from "@/lib/product-api";
import { FiVideo } from "react-icons/fi";

interface HlsPlayerProps {
  url?: string | null;
  productId?: string;
  moduleIndex?: number;
  lessonIndex?: number;
  enrollmentId?: string;
  onComplete?: () => void;
  poster?: string;
  className?: string;
}

export function HlsPlayer({
  url: directUrl,
  productId,
  moduleIndex,
  lessonIndex,
  enrollmentId,
  onComplete,
  poster,
  className = "",
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(directUrl ?? null);
  const [loading, setLoading] = useState(
    !directUrl && (productId != null || enrollmentId != null),
  );
  const [error, setError] = useState<string | null>(null);
  const completedRef = useRef(false);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (directUrl) {
      setResolvedUrl(directUrl);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchUrl() {
      setLoading(true);
      setError(null);
      try {
        let hlsUrl: string | null = null;

        if (enrollmentId && moduleIndex != null && lessonIndex != null) {
          const { ok, result } = await getVideoToken(
            enrollmentId,
            moduleIndex,
            lessonIndex,
          );
          if (cancelled) return;
          if (ok && result.data?.hlsUrl) {
            hlsUrl = result.data.hlsUrl;
          }
        } else if (productId && moduleIndex != null && lessonIndex != null) {
          const { ok, result } = await getLessonHlsUrl(
            productId,
            moduleIndex,
            lessonIndex,
          );
          if (cancelled) return;
          if (ok && result.data?.hlsUrl) {
            hlsUrl = result.data.hlsUrl;
          }
        }

        if (cancelled) return;
        if (hlsUrl) {
          setResolvedUrl(hlsUrl);
        } else {
          setError("No se pudo obtener el URL del video");
        }
      } catch {
        if (!cancelled) setError("Error al obtener URL de video");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUrl();
    return () => {
      cancelled = true;
    };
  }, [directUrl, productId, moduleIndex, lessonIndex, enrollmentId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedUrl) return;

    hlsRef.current?.destroy();

    if (resolvedUrl.match(/\.m3u8/)) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(resolvedUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = resolvedUrl;
      }
    } else {
      video.src = resolvedUrl;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [resolvedUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedUrl || !enrollmentId || !onComplete) return;

    const handleTimeUpdate = () => {
      if (completedRef.current) return;
      const duration = video.duration;
      const currentTime = video.currentTime;
      if (duration > 0 && currentTime / duration >= 0.9) {
        completedRef.current = true;
        onComplete();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [resolvedUrl, enrollmentId, onComplete]);

  function getEmbedUrl(videoUrl: string): string | null {
    const youtubeMatch = videoUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
    );
    if (youtubeMatch)
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch)
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  }

  if (loading) {
    return (
      <div
        className={`flex aspect-video items-center justify-center bg-gray-100 dark:bg-white/5 ${className}`}
      >
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-gray-500">Cargando reproductor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex aspect-video items-center justify-center bg-red-50 dark:bg-red-500/10 ${className}`}
      >
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!resolvedUrl) {
    return (
      <div
        className={`flex aspect-video items-center justify-center bg-gray-100 dark:bg-white/5 ${className}`}
      >
        <div className="text-center">
          <FiVideo size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Video no disponible</p>
        </div>
      </div>
    );
  }

  if (resolvedUrl.match(/\.m3u8/)) {
    return (
      <div className={`overflow-hidden bg-black ${className}`}>
        <video
          ref={videoRef}
          poster={poster}
          className="aspect-video w-full cursor-pointer"
          controls
          playsInline
          preload="auto"
        />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(resolvedUrl);
  if (embedUrl) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <iframe
          src={embedUrl}
          className="aspect-video w-full cursor-pointer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        poster={poster}
        className="aspect-video w-full cursor-pointer"
        controls
        playsInline
        preload="metadata"
      >
        <source src={resolvedUrl} />
      </video>
    </div>
  );
}
