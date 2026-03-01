"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Masonry from "react-masonry-css";
import { useInView } from "react-intersection-observer";

// --- Components ย่อย ---

const ImageCard = ({
  image,
  onOpenModal,
}: {
  image: any;
  onOpenModal: (img: any) => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="group mb-4 relative overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-800 cursor-pointer"
      style={{
        aspectRatio: `${image.imageWidth} / ${image.imageHeight}`,
        width: "100%",
      }}
      onClick={() => onOpenModal(image)}
    >
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center animate-pulse bg-gray-200 dark:bg-zinc-800">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            Loading
          </span>
        </div>
      )}

      <img
        src={image.imageUrl || "/placeholder.jpg"}
        alt="Gallery content"
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } group-hover:scale-105 transition-transform duration-500`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

const TagModal = ({
  image,
  onClose,
  onSelectTag,
  activeFilters,
}: {
  image: any;
  onClose: () => void;
  onSelectTag: (tag: string) => void;
  activeFilters: string[];
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
            src={image.imageUrl}
            alt="Selected"
            className="max-h-full w-auto object-contain rounded-lg shadow-md"
          />
        </div>
        <div className="flex flex-col flex-1 min-h-0 w-full md:w-80 p-5 md:p-8 border-t md:border-t-0 md:border-l border-gray-100 dark:border-zinc-800">
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 dark:text-zinc-100">
            Image Tags
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 mb-4">
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tagItem: any) => {
                const tagName =
                  typeof tagItem === "string" ? tagItem : tagItem.name;
                const isActive = activeFilters.includes(tagName);
                return (
                  <button
                    key={tagName}
                    onClick={() => onSelectTag(tagName)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-sm ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-red-500"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100"
                    }`}
                  >
                    #{tagName}
                    {isActive && (
                      <span className="text-xs bg-white/20 rounded-full p-0.5">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
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
  const isFetchingTagsRef = useRef(false);
  const isFetchingImagesRef = useRef(false);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const selectedTagsContainerRef = useRef<HTMLDivElement>(null);

  const [tagSkip, setTagSkip] = useState(0);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [isTagsLastPage, setIsTagsLastPage] = useState(false);
  const [tagCategories, setTagCategories] = useState<
    { tag: string; img: string }[]
  >([]);

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImagesLastPage, setIsImagesLastPage] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hasScrolled, setHasScrolled] = useState(false);

  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isSelectedOverflowing, setIsSelectedOverflowing] = useState(false);
  const [showAllSelectedModal, setShowAllSelectedModal] = useState(false);

  const { ref, inView } = useInView({ threshold: 0, rootMargin: "600px" });

  const getInitialLimit = useCallback(() => {
    if (typeof window === "undefined") return 12;
    const width = window.innerWidth;
    if (width >= 1600) return 40;
    if (width >= 1300) return 30;
    return 12;
  }, []);

  // --- Functions ---
  const fetchTags = useCallback(
    async (reset = false) => {
      if (isFetchingTagsRef.current || (isTagsLastPage && !reset)) return;
      isFetchingTagsRef.current = true;
      setIsTagsLoading(true);

      const currentSkip = reset ? 0 : tagSkip;
      const limit = reset ? 30 : 20;

      try {
        const response = await fetch(
          `/api/tags?limit=${limit}&skip=${currentSkip}`,
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          if (reset) {
            setTagCategories(data);
            setTagSkip(data.length);
            setIsTagsLastPage(data.length < limit);
          } else {
            setTagCategories((prev) => [...prev, ...data]);
            setTagSkip((prev) => prev + data.length);
            if (data.length < limit) setIsTagsLastPage(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsTagsLoading(false);
        isFetchingTagsRef.current = false;
      }
    },
    [tagSkip, isTagsLastPage],
  );

  const fetchImages = useCallback(
    async (limit: number, filterTags: string[], isReset: boolean = false) => {
      if (isFetchingImagesRef.current || (isImagesLastPage && !isReset)) return;
      isFetchingImagesRef.current = true;
      setLoading(true);

      try {
        setImages((prevImages) => {
          const currentImagesCount = isReset ? 0 : prevImages.length;

          fetch(
            `/api/artworks?limit=${limit}&skip=${currentImagesCount}&tags=${encodeURIComponent(filterTags.join(","))}`,
          )
            .then((res) => res.json())
            .then((newItems) => {
              if (Array.isArray(newItems)) {
                setIsImagesLastPage(newItems.length < limit);

                setImages((prev) => {
                  if (isReset) return newItems;

                  // 💡 จุดที่แก้ไข: กรองเอาเฉพาะรูปที่ ID ไม่ซ้ำกับที่มีอยู่เดิม
                  const existingIds = new Set(prev.map((img) => img.id));
                  const uniqueNewItems = newItems.filter(
                    (img) => !existingIds.has(img.id),
                  );

                  return [...prev, ...uniqueNewItems];
                });
              }
            })
            .catch((err) => console.error("❌ Fetch Artworks Error:", err))
            .finally(() => {
              setLoading(false);
              isFetchingImagesRef.current = false;
            });

          return prevImages;
        });
      } catch (error) {
        setLoading(false);
        isFetchingImagesRef.current = false;
      }
    },
    [isImagesLastPage],
  );

  const checkNavScroll = useCallback(() => {
    if (navScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);

      if (
        scrollLeft + clientWidth >= scrollWidth - 400 &&
        !isFetchingTagsRef.current &&
        !isTagsLastPage
      ) {
        fetchTags();
      }
    }
  }, [fetchTags, isTagsLastPage]);

  // --- Effects ---

  // 1. Initial Tags load
  useEffect(() => {
    fetchTags(true);
  }, []);

  // 2. เมื่อมีการ Scroll ครั้งแรก (ปลดล็อค Infinite Scroll)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setHasScrolled(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. จัดการการ Reset เมื่อเปลี่ยน Filter (แยกจาก Scroll Load)
  useEffect(() => {
    setIsImagesLastPage(false);
    setHasScrolled(false);
    fetchImages(getInitialLimit(), activeFilters, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeFilters]); // รันเฉพาะตอนเลือก Tag ใหม่เท่านั้น

  // 4. Infinite Scroll (โหลดเพิ่มเมื่อไถลงมา)
  useEffect(() => {
    if (inView && !loading && !isImagesLastPage && hasScrolled) {
      fetchImages(getInitialLimit(), activeFilters, false);
    }
  }, [
    inView,
    loading,
    isImagesLastPage,
    hasScrolled,
    activeFilters,
    fetchImages,
    getInitialLimit,
  ]);

  useEffect(() => {
    const handleResize = () => {
      checkNavScroll();
      if (selectedTagsContainerRef.current) {
        const { scrollWidth, clientWidth } = selectedTagsContainerRef.current;
        setIsSelectedOverflowing(scrollWidth > clientWidth + 2);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkNavScroll]);

  const toggleFilter = (tag: string) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const scrollNav = (direction: "left" | "right") => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
      setTimeout(checkNavScroll, 400);
    }
  };

  return (
    <div className="max-w-full w-full p-4 bg-gray-50 dark:bg-zinc-950 min-h-screen transition-colors duration-300">
      <div className="sticky top-0 z-30 bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-md pt-4 pb-2 mb-6 -mx-4 sm:mx-0 border-b border-gray-200 dark:border-zinc-800">
        <div className="relative flex items-center group/nav overflow-hidden sm:overflow-visible px-4 sm:px-0 mb-3">
          {canScrollLeft && (
            <button
              onClick={() => scrollNav("left")}
              className="absolute left-0 z-10 w-10 h-10 ml-2 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
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
            className="flex overflow-x-auto gap-3 items-center w-full px-2 sm:px-8 [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            <button
              onClick={() => setActiveFilters([])}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold transition-all ${
                activeFilters.length === 0
                  ? "bg-gray-800 text-white dark:bg-white dark:text-black shadow-md"
                  : "bg-white text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            {tagCategories.map((item) => (
              <button
                key={item.tag}
                onClick={() => toggleFilter(item.tag)}
                className={`flex-shrink-0 flex items-center gap-2 pr-5 pl-2 py-2 rounded-full font-medium transition-all ${
                  activeFilters.includes(item.tag)
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-white text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-blue-50"
                }`}
              >
                <img
                  src={item.img}
                  alt={item.tag}
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                />
                <span>#{item.tag}</span>
              </button>
            ))}
            {isTagsLoading && (
              <div className="flex-shrink-0 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          {canScrollRight && (
            <button
              onClick={() => scrollNav("right")}
              className="absolute right-0 z-10 w-10 h-10 mr-2 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
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

        {activeFilters.length > 0 && (
          <div className="relative flex items-center px-4 sm:px-10 mt-1 pb-2 w-full">
            <div className="flex-shrink-0 flex items-center mr-3">
              <span className="text-sm font-medium text-gray-500">
                Selected:
              </span>
            </div>
            <div
              ref={selectedTagsContainerRef}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap w-full"
            >
              {activeFilters.map((tag) => (
                <span
                  key={tag}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 rounded-lg text-sm font-semibold border border-blue-200 dark:border-blue-800"
                >
                  #{tag}{" "}
                  <button
                    onClick={() => toggleFilter(tag)}
                    className="text-blue-600 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {activeFilters.length > 1 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="ml-2 text-sm font-bold text-red-500 hover:text-red-600 hover:underline bg-red-50 hover:bg-red-100 dark:bg-red-500/10 px-2 py-0.5 rounded"
                >
                  Clear all
                </button>
              )}
            </div>
            {isSelectedOverflowing && (
              <div className="absolute right-4 sm:right-10 top-0 bottom-2 flex items-center pl-8 bg-gradient-to-l from-gray-50 dark:from-zinc-950 via-gray-50/90 to-transparent">
                <button
                  onClick={() => setShowAllSelectedModal(true)}
                  className="px-3 py-1 bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                >
                  ...
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Masonry
        breakpointCols={{
          default: 8,
          1600: 6,
          1300: 5,
          1100: 4,
          700: 2,
          500: 1,
        }}
        className="flex w-auto -ml-4"
        columnClassName="pl-4"
      >
        {images.map((img, index) => (
          <ImageCard
            key={`${img.id}-${index}`} // 💡 ใช้ ID ผสมกับ Index เพื่อความชัวร์ว่าไม่ซ้ำแน่ๆ
            image={img}
            onOpenModal={setSelectedImage}
          />
        ))}
      </Masonry>

      <div
        ref={ref}
        className="h-20 w-full flex items-center justify-center mt-10"
      >
        {loading && (
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {!isImagesLastPage && !hasScrolled && images.length > 0 && (
        <div className="text-center py-4 text-gray-400 text-sm italic">
          Scroll down to see more content...
        </div>
      )}

      {isImagesLastPage && images.length > 0 && (
        <div className="text-center py-10 text-gray-500 font-medium">
          — End of Gallery —
        </div>
      )}

      <TagModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onSelectTag={toggleFilter}
        activeFilters={activeFilters}
      />

      {showAllSelectedModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowAllSelectedModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                Selected Tags ({activeFilters.length})
              </h3>
              <button
                onClick={() => setShowAllSelectedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-2 overflow-y-auto pr-2 mb-6 flex-1 content-start">
              {activeFilters.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 rounded-lg text-sm font-semibold border border-blue-200 dark:border-blue-800"
                >
                  #{tag}{" "}
                  <button
                    onClick={() => toggleFilter(tag)}
                    className="text-blue-600 hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setActiveFilters([]);
                  setShowAllSelectedModal(false);
                }}
                className="text-red-500 font-medium hover:underline"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowAllSelectedModal(false)}
                className="px-6 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold"
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
