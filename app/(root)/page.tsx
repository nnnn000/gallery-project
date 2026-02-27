"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Masonry from "react-masonry-css";
import { useInView } from "react-intersection-observer";

// --- ข้อมูล Tags และรูปภาพจำลองสำหรับ Navbar ---
const TAG_CATEGORIES = [
  { tag: "#anime", img: "https://picsum.photos/seed/anime/50/50" },
  { tag: "#male_character", img: "https://picsum.photos/seed/male/50/50" },
  { tag: "#female_character", img: "https://picsum.photos/seed/female/50/50" },
  { tag: "#scenery", img: "https://picsum.photos/seed/scenery/50/50" },
  { tag: "#cyberpunk", img: "https://picsum.photos/seed/cyber/50/50" },
  { tag: "#fantasy", img: "https://picsum.photos/seed/fantasy/50/50" },
  { tag: "#nature", img: "https://picsum.photos/seed/nature/50/50" },
  { tag: "#portrait", img: "https://picsum.photos/seed/portrait/50/50" },
  { tag: "#cityscape", img: "https://picsum.photos/seed/city/50/50" },
  { tag: "#mecha", img: "https://picsum.photos/seed/mecha/50/50" },
  { tag: "#food", img: "https://picsum.photos/seed/food/50/50" },
  { tag: "#animals", img: "https://picsum.photos/seed/animals/50/50" },
  { tag: "#vintage", img: "https://picsum.photos/seed/vintage/50/50" },
  { tag: "#watercolor", img: "https://picsum.photos/seed/watercolor/50/50" },
  { tag: "#3d_render", img: "https://picsum.photos/seed/3d/50/50" },
];

const MOCK_TAGS_LIST = TAG_CATEGORIES.map((t) => t.tag);

const getRandomTags = (forceTags: string[] = []) => {
  const shuffled = [...MOCK_TAGS_LIST]
    .filter((t) => !forceTags.includes(t))
    .sort(() => 0.5 - Math.random());

  const extraCount = Math.floor(Math.random() * 6) + 5;
  const selected = [...forceTags, ...shuffled.slice(0, extraCount)];

  return selected;
};

const Skeleton = ({ height }: { height: number }) => (
  <div
    className="w-full bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-xl"
    style={{ height: `${height}px` }}
  />
);

const ImageCard = ({
  image,
  onOpenModal,
}: {
  image: any;
  onOpenModal: (img: any) => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [randomHeight] = useState(Math.floor(Math.random() * 200 + 250));

  return (
    <div
      className="group mb-4 relative overflow-hidden rounded-xl shadow-sm bg-gray-200 dark:bg-zinc-800 cursor-pointer"
      onClick={() => onOpenModal(image)}
    >
      {!isLoaded && <Skeleton height={randomHeight} />}
      <img
        src={image.url}
        alt="Gallery content"
        className={`w-full h-auto object-cover transition-all duration-700 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } group-hover:scale-105`}
        onLoad={() => setIsLoaded(true)}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal(image);
        }}
        className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full hidden md:flex items-center justify-center transition-all duration-300 hover:scale-110 text-gray-800 dark:text-gray-200 shadow-lg font-bold text-lg z-10 opacity-0 group-hover:opacity-100"
      >
        #
      </button>
    </div>
  );
};

// --- Modal Component (แสดงข้อมูลรูปภาพ) ---
const TagModal = ({
  image,
  onClose,
  onSelectTag,
}: {
  image: any;
  onClose: () => void;
  onSelectTag: (tag: string) => void;
}) => {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full max-h-[90vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4 h-[40vh] md:h-auto md:flex-1 md:min-h-0">
          <img
            src={image.url}
            alt="Selected content"
            className="max-h-full w-auto object-contain rounded-lg shadow-md"
          />
        </div>

        <div className="flex flex-col flex-1 min-h-0 w-full md:w-80 p-5 md:p-8 border-t md:border-t-0 md:border-l border-gray-100 dark:border-zinc-800">
          <h3 className="text-xl md:text-2xl font-bold mb-4 flex-shrink-0 text-gray-800 dark:text-zinc-100">
            Image Tags
          </h3>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2 mb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => {
                    onSelectTag(tag);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all shadow-sm cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function InteractiveGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Refs & States สำหรับ Main Nav
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Refs & States สำหรับ Selected Tags (โหมดโชว์ ... เมื่อล้นจอ)
  const selectedTagsContainerRef = useRef<HTMLDivElement>(null);
  const [isSelectedOverflowing, setIsSelectedOverflowing] = useState(false);
  const [showAllSelectedModal, setShowAllSelectedModal] = useState(false); // ควบคุมเปิด/ปิด Modal

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  const fetchImages = useCallback(
    async (limit: number, filterTags: string[], isReset: boolean = false) => {
      if (loading) return;
      setLoading(true);

      const newItems = Array.from({ length: limit }).map((_, i) => ({
        id: Math.random().toString(36) + Date.now() + i,
        url: `https://picsum.photos/seed/${Math.random()}/500/${Math.floor(
          Math.random() * 300 + 400,
        )}`,
        tags: getRandomTags(filterTags),
      }));

      await new Promise((r) => setTimeout(r, 600));

      setImages((prev) => (isReset ? newItems : [...prev, ...newItems]));
      setLoading(false);
    },
    [loading],
  );

  const toggleFilter = (tag: string) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const checkNavScroll = useCallback(() => {
    if (navScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  }, []);

  // ฟังก์ชันเช็กว่า Tag ที่เลือก "ล้นจอ" หรือไม่
  const checkSelectedOverflow = useCallback(() => {
    if (selectedTagsContainerRef.current) {
      const { scrollWidth, clientWidth } = selectedTagsContainerRef.current;
      // ถ้าความกว้างข้อมูลข้างใน > ความกว้างกล่องที่แสดงผล = ถือว่าล้นจอ
      setIsSelectedOverflowing(scrollWidth > clientWidth + 2);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      checkNavScroll();
      checkSelectedOverflow();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkNavScroll, checkSelectedOverflow]);

  // คอยเช็กว่าเนื้อหาล้นไหมเวลาเพิ่ม/ลด Tag
  useEffect(() => {
    const timeout = setTimeout(() => {
      checkSelectedOverflow();
    }, 50); // รอ DOM เรนเดอร์นิดนึงแล้วค่อยเช็ก
    return () => clearTimeout(timeout);
  }, [activeFilters, checkSelectedOverflow]);

  // ปิด Modal อัตโนมัติถ้าเคลียร์ Tag หมดแล้ว
  useEffect(() => {
    if (activeFilters.length === 0) {
      setShowAllSelectedModal(false);
    }
  }, [activeFilters]);

  const scrollNav = (direction: "left" | "right") => {
    if (navScrollRef.current) {
      const scrollAmount = 300;
      navScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkNavScroll, 400);
    }
  };

  useEffect(() => {
    setHasScrolled(false);
    fetchImages(8, activeFilters, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !hasScrolled) {
        setHasScrolled(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  useEffect(() => {
    if (inView && !loading && hasScrolled) {
      fetchImages(8, activeFilters, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, hasScrolled]);

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-zinc-950 min-h-screen transition-colors duration-300">
      {/* --- Navigation & Selected Tags Container --- */}
      <div className="sticky top-0 z-30 bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-md pt-4 pb-2 mb-6 -mx-4 sm:mx-0 border-b border-gray-200 dark:border-zinc-800">
        {/* --- 1. Main Scrollable Nav --- */}
        <div className="relative flex items-center group/nav overflow-hidden sm:overflow-visible px-4 sm:px-0 mb-3">
          {canScrollLeft && (
            <button
              onClick={() => scrollNav("left")}
              className="absolute left-0 z-10 w-10 h-10 ml-2 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          )}

          <div
            ref={navScrollRef}
            onScroll={checkNavScroll}
            className="flex overflow-x-auto gap-3 items-center w-full px-2 sm:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] scroll-smooth"
          >
            <button
              onClick={() => setActiveFilters([])}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold transition-all ${
                activeFilters.length === 0
                  ? "bg-gray-800 text-white dark:bg-white dark:text-black shadow-md scale-105"
                  : "bg-white text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
              }`}
            >
              All
            </button>

            {TAG_CATEGORIES.map((item) => {
              const isActive = activeFilters.includes(item.tag);
              return (
                <button
                  key={item.tag}
                  onClick={() => toggleFilter(item.tag)}
                  className={`flex-shrink-0 flex items-center gap-2 pr-5 pl-2 py-2 rounded-full font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-white text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700 border border-transparent dark:border-zinc-700"
                  }`}
                >
                  <img
                    src={item.img}
                    alt={item.tag}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                  <span>{item.tag}</span>
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scrollNav("right")}
              className="absolute right-0 z-10 w-10 h-10 mr-2 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          )}
        </div>

        {/* --- 2. Selected Tags Area (โหมดใช้พื้นที่จำกัด) --- */}
        {activeFilters.length > 0 && (
          <div className="relative flex items-center px-4 sm:px-10 mt-1 pb-2 w-full">
            <span className="flex-shrink-0 text-sm font-medium text-gray-500 dark:text-zinc-400 mr-2">
              Selected:
            </span>

            {/* กล่องเก็บ Tag ที่ซ่อนส่วนที่ล้นหน้าจอออกไป (overflow-hidden) */}
            <div
              ref={selectedTagsContainerRef}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap w-full"
            >
              {activeFilters.map((tag) => (
                <span
                  key={tag}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 rounded-lg text-sm font-semibold border border-blue-200 dark:border-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => toggleFilter(tag)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors text-blue-600 dark:text-blue-300 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>

            {/* ถ้าล้นจอ ให้เอา ... มาบังไว้ที่ขอบขวาพร้อมฉากหลังไล่ระดับสี (Gradient Fade) */}
            {isSelectedOverflowing && (
              <div className="absolute right-4 sm:right-10 top-0 bottom-2 flex items-center pl-8 bg-gradient-to-l from-gray-50 dark:from-zinc-950 via-gray-50/90 dark:via-zinc-950/90 to-transparent">
                <button
                  onClick={() => setShowAllSelectedModal(true)}
                  className="px-3 py-1 bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  ...
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Gallery Grid --- */}
      {images.length === 0 && !loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No images found.
        </div>
      ) : (
        <Masonry
          breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
          className="flex w-auto -ml-4"
          columnClassName="pl-4"
        >
          {images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              onOpenModal={(selected) => setSelectedImage(selected)}
            />
          ))}
        </Masonry>
      )}

      {/* --- Sentinel: จุดตรวจจับ --- */}
      <div
        ref={ref}
        className="h-20 w-full flex items-center justify-center mt-10"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <TagModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onSelectTag={(tag) => {
          if (!activeFilters.includes(tag)) {
            toggleFilter(tag);
          }
        }}
      />

      {/* --- Modal สำหรับแสดง Selected Tags ทั้งหมด (โผล่มาเมื่อกด ...) --- */}
      {showAllSelectedModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setShowAllSelectedModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header ของ Modal */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                Selected Tags ({activeFilters.length})
              </h3>
              <button
                onClick={() => setShowAllSelectedModal(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* List ของ Tag (Scrollable) */}
            <div className="flex flex-wrap gap-2 overflow-y-auto pr-2 mb-6 flex-1 min-h-0 content-start [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {activeFilters.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 rounded-lg text-sm font-semibold shadow-sm border border-blue-200 dark:border-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => toggleFilter(tag)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors text-blue-600 dark:text-blue-300 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>

            {/* Footer buttons (ตรึงไว้ด้านล่างสุด) */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800 flex-shrink-0">
              <button
                onClick={() => {
                  setActiveFilters([]);
                  setShowAllSelectedModal(false);
                }}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors px-2 py-1"
              >
                Clear all
              </button>

              <button
                onClick={() => setShowAllSelectedModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
