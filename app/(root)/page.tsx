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

// ฟังก์ชันสุ่ม Tag (ปรับปรุงให้บังคับใส่ได้หลาย Tag)
const getRandomTags = (forceTags: string[] = []) => {
  // เอา Tag ที่ไม่ได้ถูก force มาสุ่ม
  const shuffled = [...MOCK_TAGS_LIST]
    .filter((t) => !forceTags.includes(t))
    .sort(() => 0.5 - Math.random());

  // สุ่ม Tag เพิ่มเติมอีก 1-3 ตัว เพื่อให้รูปดูมีมิติ
  const extraCount = Math.floor(Math.random() * 3) + 1;
  const selected = [...forceTags, ...shuffled.slice(0, extraCount)];

  return selected;
};

// --- Skeleton Component ---
const Skeleton = ({ height }: { height: number }) => (
  <div
    className="w-full bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-xl"
    style={{ height: `${height}px` }}
  />
);

// --- ImageCard Component ---
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
    <div className="group mb-4 relative overflow-hidden rounded-xl shadow-sm bg-gray-200 dark:bg-zinc-800">
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
        className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 text-gray-800 dark:text-gray-200 shadow-lg font-bold text-lg cursor-pointer z-10"
      >
        #
      </button>
    </div>
  );
};

// --- Modal Component ---
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
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4">
          <img
            src={image.url}
            alt="Selected content"
            className="max-h-[50vh] md:max-h-[80vh] w-auto object-contain rounded-lg shadow-md"
          />
        </div>

        <div className="w-full md:w-80 p-8 flex flex-col border-l border-gray-100 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-zinc-100">
            Image Tags
          </h3>

          <div className="flex flex-wrap gap-2 mb-auto">
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

          <button
            onClick={onClose}
            className="mt-8 w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
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

  // เปลี่ยนมาเก็บเป็น Array สำหรับรับหลาย Tag
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const navScrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
        tags: getRandomTags(filterTags), // ส่ง Array ของ tag ที่เลือกไปบังคับสุ่ม
      }));

      await new Promise((r) => setTimeout(r, 600));

      setImages((prev) => (isReset ? newItems : [...prev, ...newItems]));
      setLoading(false);
    },
    [loading],
  );

  // ฟังก์ชันสลับ/เพิ่ม/ลด Tag
  const toggleFilter = (tag: string) => {
    setActiveFilters(
      (prev) =>
        prev.includes(tag)
          ? prev.filter((t) => t !== tag) // ถ้ามีอยู่แล้ว ให้ลบออก
          : [...prev, tag], // ถ้ายังไม่มี ให้เพิ่มเข้าไป
    );
  };

  const checkNavScroll = () => {
    if (navScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkNavScroll();
    window.addEventListener("resize", checkNavScroll);
    return () => window.removeEventListener("resize", checkNavScroll);
  }, []);

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

  // ดักจับเมื่อ Array ของ activeFilters มีการเปลี่ยนแปลง
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
      <div className="sticky top-0 z-30 bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-md pt-4 pb-4 mb-6 -mx-4 sm:mx-0 border-b border-gray-200 dark:border-zinc-800">
        {/* --- Scrollable Nav --- */}
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
              onClick={() => setActiveFilters([])} // กด All คือล้าง Array
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

        {/* --- Selected Tags Area (โผล่มาเมื่อมีการเลือก) --- */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-6 sm:px-10 mt-1 animate-fadeIn">
            <span className="text-sm font-medium text-gray-500 dark:text-zinc-400 mr-1">
              Selected:
            </span>
            {activeFilters.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 rounded-lg text-sm font-semibold shadow-sm border border-blue-200 dark:border-blue-800"
              >
                {tag}
                <button
                  onClick={() => toggleFilter(tag)}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors text-blue-600 dark:text-blue-300 hover:text-red-500 dark:hover:text-red-400"
                  title="Remove"
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

            {/* ปุ่ม Clear All (แสดงเมื่อเลือกมากกว่า 1 แท็ก) */}
            {activeFilters.length > 1 && (
              <button
                onClick={() => setActiveFilters([])}
                className="text-sm text-gray-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 underline ml-2 transition-colors font-medium"
              >
                Clear all
              </button>
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
          // ถ้ากดจาก Modal และ tag นั้นยังไม่ได้เลือก ให้เพิ่มเข้าไป
          if (!activeFilters.includes(tag)) {
            toggleFilter(tag);
          }
        }}
      />
    </div>
  );
}
