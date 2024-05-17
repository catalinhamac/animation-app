import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { hightlightsSlides } from "../utils";

import play from "../images/play.svg";
import pause from "../images/pause.svg";
import replay from "../images/replay.svg";
import right from "../images/replay.svg";
import watch from "../images/replay.svg";

gsap.registerPlugin(ScrollTrigger);

export const Carousel = () => {
  useGSAP(() => {
    gsap.to("#title", { opacity: 1, y: 0 });
    gsap.to(".link", { opacity: 1, y: 0, duration: 1, stagger: 0.25 });
  }, []);

  const videoRef = useRef<HTMLVideoElement[]>([]);
  const videoSpanRef = useRef<HTMLSpanElement[]>([]);
  const videoSpanVideoRef = useRef<HTMLSpanElement[]>([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState<
    React.SyntheticEvent<HTMLVideoElement, Event>[]
  >([]);
  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

  console.log(loadedData);

  useGSAP(() => {
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut",
    });

    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none",
      },
      onComplete: () => {
        setVideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [isEnd, videoId]);

  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      let anim = gsap.to(span[videoId], {
        onUpdate: () => {
          const progress = Math.ceil(anim.progress() * 100);

          if (progress !== currentProgress) {
            currentProgress = progress;

            gsap.to(videoSpanVideoRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw"
                  : window.innerWidth < 1200
                  ? "10vw"
                  : "4vw",
            });

            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },

        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoSpanVideoRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });

      if (videoId === 0) {
        anim.restart();
      }

      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };

      if (isPlaying) {
        gsap.ticker.add(animUpdate);
      } else {
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay, isPlaying]);

  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  const handleProcess = (type: string, i = 0) => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }));
        break;

      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true }));
        break;

      case "video-reset":
        setVideo((pre) => ({ ...pre, videoId: 0, isLastVideo: false }));
        break;

      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      case "play":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      default:
        return video;
    }
  };

  const handleLoadedMetaData = (
    i: number,
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => setLoadedData((pre) => [...pre, e]);

  return (
    <section
      id="highlights"
      className="w-screen overflow-hidden h-full common-padding bg-zinc"
    >
      <div className="screen-max-width">
        <div className="mb-12 w-full md:flex items-end justify-between">
          <h1 id="title" className="section-heading">
            Get the highlights.
          </h1>

          <div className="flex flex-wrap items-end gap-5">
            <p className="link">
              Watch the film
              <img src={watch} alt="watch" className="ml-2" />
            </p>
            <p className="link">
              Watch the event
              <img src={right} alt="right" className="ml-2" />
            </p>
          </div>
        </div>

        <>
          <div className="flex items-center">
            {hightlightsSlides.map((list, i) => (
              <div key={list.id} id="slider" className="sm:pr-20 pr-10">
                <div className="video-carousel_container">
                  <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                    <video
                      id="video"
                      playsInline={true}
                      className={`${
                        list.id === 2 && "translate-x-44"
                      } pointer-events-none`}
                      preload="auto"
                      muted
                      ref={(el) =>
                        (videoRef.current[i] = el as HTMLVideoElement)
                      }
                      onEnded={() =>
                        i !== 3
                          ? handleProcess("video-end", i)
                          : handleProcess("video-last")
                      }
                      onPlay={() =>
                        setVideo((pre) => ({ ...pre, isPlaying: true }))
                      }
                      onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                    >
                      <source src={list.video} type="video/mp4" />
                    </video>
                  </div>

                  <div className="absolute top-12 left-[5%] z-10">
                    {list.textLists.map((text, i) => (
                      <p key={i} className="md:text-2xl text-xl font-medium">
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative flex-center mt-10">
            <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
              {videoRef.current.map((_, i) => (
                <span
                  key={i}
                  className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
                  ref={(el) =>
                    (videoSpanVideoRef.current[i] = el as HTMLSpanElement)
                  }
                >
                  <span
                    className="absolute h-full w-full rounded-full"
                    ref={(el) =>
                      (videoSpanRef.current[i] = el as HTMLVideoElement)
                    }
                  />
                </span>
              ))}
            </div>

            <button className="control-btn">
              <img
                src={isLastVideo ? replay : !isPlaying ? play : pause}
                alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
                onClick={
                  isLastVideo
                    ? () => handleProcess("video-reset")
                    : !isPlaying
                    ? () => handleProcess("play")
                    : () => handleProcess("pause")
                }
              />
            </button>
          </div>
        </>
      </div>
    </section>
  );
};
