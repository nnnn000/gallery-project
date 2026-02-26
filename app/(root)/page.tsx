"use client";

import { useState, useEffect, useCallback } from "react";
import Masonry from "react-masonry-css";
import { useInView } from "react-intersection-observer";

// --- รายชื่อ Tag จำลอง ---
const MOCK_TAGS = [
  "#anime",
  "#male_character",
  "#female_character",
  "#scenery",
  "#cyberpunk",
  "#fantasy",
  "#nature",
  "#portrait",
  "#architecture",
  "#minimal",
];

// ฟังก์ชันสุ่ม Tag (ได้ 2-4 แท็กต่อรูป)
const getRandomTags = () => {
  const shuffled = [...MOCK_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 2);
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
  onTagClick,
}: {
  image: any;
  onTagClick: (img: any) => void;
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

      {/* ปุ่ม # ที่จะโผล่มาเมื่อ Hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTagClick(image);
        }}
        className="absolute bottom-4 right-4 w-10 h-10 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-gray-200 shadow-md font-bold text-lg cursor-pointer z-10"
      >
        #
      </button>
    </div>
  );
};

// --- Modal Component ---
const TagModal = ({ image, onClose }: { image: any; onClose: () => void }) => {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full max-h-[90vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()} // ป้องกันการคลิกข้างในแล้ว Modal ปิด
      >
        {/* ด้านซ้าย: รูปภาพ */}
        <div className="flex-1 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center p-4">
          <img
            src={image.url}
            alt="Selected content"
            className="max-h-[50vh] md:max-h-[80vh] w-auto object-contain rounded-lg shadow-sm"
          />
        </div>

        {/* ด้านขวา: Tags */}
        <div className="w-full md:w-80 p-8 flex flex-col border-l border-gray-200 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-zinc-100">
            Image Tags
          </h3>

          <div className="flex flex-wrap gap-2 mb-auto">
            {image.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
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

  // State สำหรับเก็บรูปภาพที่ถูกเลือกมาเปิด Modal
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const fetchImages = useCallback(
    async (limit: number) => {
      if (loading) return;
      setLoading(true);

      const newItems = Array.from({ length: limit }).map((_, i) => ({
        id: Math.random().toString(36) + Date.now() + i,
        url: `https://picsum.photos/seed/${Math.random()}/500/${Math.floor(
          Math.random() * 300 + 400,
        )}`,
        tags: getRandomTags(), // สุ่ม Tag ให้แต่ละรูป
      }));

      await new Promise((r) => setTimeout(r, 800));
      setImages((prev) => [...prev, ...newItems]);
      setLoading(false);
    },
    [loading],
  );

  useEffect(() => {
    fetchImages(8);
  }, []);

  useEffect(() => {
    const handleFirstScroll = () => {
      if (window.scrollY > 10) {
        setHasScrolled(true);
        window.removeEventListener("scroll", handleFirstScroll);
      }
    };
    window.addEventListener("scroll", handleFirstScroll);
    return () => window.removeEventListener("scroll", handleFirstScroll);
  }, []);

  useEffect(() => {
    if (inView && !loading && hasScrolled) {
      fetchImages(8);
    }
  }, [inView, loading, fetchImages, hasScrolled]);

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-zinc-950 min-h-screen transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-zinc-100">
        My Gallery
      </h1>

      <Masonry
        breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
        className="flex w-auto -ml-4"
        columnClassName="pl-4"
      >
        {images.map((img) => (
          <ImageCard
            key={img.id}
            image={img}
            onTagClick={(selected) => setSelectedImage(selected)}
          />
        ))}
      </Masonry>

      {/* Sentinel */}
      <div
        ref={ref}
        className="h-20 w-full flex items-center justify-center mt-10"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Modal โชว์ตอนมีรูปภาพถูกเลือก */}
      <TagModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
