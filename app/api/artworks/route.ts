// app/api/artworks/route.ts
import { NextRequest, NextResponse } from "next/server";
// 1. เปลี่ยนการ import มาใช้ตัวแปรที่เราสร้างไว้ใน lib
import { prisma } from "@/lib/prisma";

// app/api/artworks/route.ts

// ... (ส่วนการ import และ setup อื่นๆ เหมือนเดิม)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "8");
  const skip = parseInt(searchParams.get("skip") || "0");
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

  try {
    const artworks = await prisma.artwork.findMany({
      where:
        tags.length > 0
          ? {
              // 💡 เปลี่ยนจาก "in" เป็นการตรวจสอบว่า "ทุก Tag" ต้องมีอยู่จริง
              AND: tags.map((tagName) => ({
                tags: {
                  some: {
                    name: tagName,
                  },
                },
              })),
            }
          : {},
      take: limit,
      skip: skip,
      include: {
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // ... (ส่วนการแปลง BigInt และส่ง Response เหมือนเดิม)
    const safeArtworks = artworks.map((art) => ({
      ...art,
      id: art.id.toString(),
      uploaderId: art.uploaderId.toString(),
      pixivId: art.pixivId?.toString(),
      tags: art.tags.map((t) => t.name),
      imageWidth: art.imageWidth || 500,
      imageHeight: art.imageHeight || 500,
    }));

    return NextResponse.json(safeArtworks);
  } catch (error) {
    console.error("❌ Fetch Artworks Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
