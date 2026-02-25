"use client";

import { useState, useEffect, useCallback } from "react";
import Masonry from "react-masonry-css";
import { useInView } from "react-intersection-observer";

// --- Skeleton Component (คงเดิม) ---
const Skeleton = ({ height }: { height: number }) => (
  <div
    className="w-full bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-xl"
    style={{ height: `${height}px` }}
  />
);

const ImageCard = ({ url }: { url: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [randomHeight] = useState(Math.floor(Math.random() * 200 + 250));

  return (
    <div className="mb-4 relative overflow-hidden rounded-xl shadow-sm bg-gray-200 dark:bg-zinc-800">
      {!isLoaded && <Skeleton height={randomHeight} />}
      <img
        src={url}
        alt="Gallery content"
        className={`w-full h-auto object-cover transition-opacity duration-700 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } hover:scale-105 transition-transform duration-500`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default function InteractiveGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false); // ตัวแปรใหม่: เช็กว่ามีการ scroll หรือยัง

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px", // ลด margin ลงมาหน่อยเพื่อไม่ให้รีบโหลดเกินไป
  });

  // ฟังก์ชันดึงภาพ
  const fetchImages = useCallback(
    async (limit: number) => {
      if (loading) return;
      setLoading(true);

      const newItems = Array.from({ length: limit }).map((_, i) => ({
        id: Math.random().toString(36) + Date.now() + i,
        url: `https://picsum.photos/seed/${Math.random()}/500/${Math.floor(
          Math.random() * 300 + 400,
        )}`,
      }));

      await new Promise((r) => setTimeout(r, 800));
      setImages((prev) => [...prev, ...newItems]);
      setLoading(false);
    },
    [loading],
  );

  // 1. โหลดครั้งแรก 8 รูป (จบที่นี่ ห้ามโหลดเพิ่มเอง)
  useEffect(() => {
    fetchImages(8);
  }, []);

  // 2. ดักฟังการ Scroll ครั้งแรกของผู้ใช้
  useEffect(() => {
    const handleFirstScroll = () => {
      if (window.scrollY > 10) {
        // ถ้าขยับจอลงมาเกิน 10px
        setHasScrolled(true);
        window.removeEventListener("scroll", handleFirstScroll); // ลบ event ทิ้งเพื่อประหยัดสเปค
      }
    };
    window.addEventListener("scroll", handleFirstScroll);
    return () => window.removeEventListener("scroll", handleFirstScroll);
  }, []);

  // 3. โหลดเพิ่ม: ต้อง "เห็นจุดตรวจจับ" AND "ต้องเคย Scroll แล้ว" เท่านั้น
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
          <ImageCard key={img.id} url={img.url} />
        ))}
      </Masonry>

      {/* Sentinel: จุดตรวจจับ */}
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
    </div>
  );
}
