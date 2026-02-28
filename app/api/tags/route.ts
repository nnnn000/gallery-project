// app/api/tags/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. ดึง Tags ทั้งหมด พร้อมรูปภาพที่เกี่ยวข้องทั้งหมด (ไม่ใช่แค่ 1)
    // เพื่อให้เรามี "ตัวเลือก" กรณีรูปแรกซ้ำกับ Tag อื่น
    const tagsWithArtworks = await prisma.tag.findMany({
      include: {
        artworks: {
          select: {
            id: true,
            imageUrl: true,
          },
          orderBy: { createdAt: "desc" }, // เอารูปล่าสุดก่อน
        },
      },
    });

    const usedArtworkIds = new Set<string>(); // เก็บ ID รูปที่ถูกเลือกไปแล้ว
    const formattedTags = [];

    // 2. วนลูปคัดเลือกรูปให้แต่ละ Tag โดยไม่ให้ซ้ำกัน
    for (const tag of tagsWithArtworks) {
      // ค้นหารูปแรกใน Tag นี้ที่ยังไม่เคยถูกใช้เป็นไอคอนของ Tag อื่น
      const uniqueArtwork = tag.artworks.find(
        (art) => !usedArtworkIds.has(art.id.toString()),
      );

      if (uniqueArtwork) {
        usedArtworkIds.add(uniqueArtwork.id.toString());
        formattedTags.push({
          tag: tag.name,
          img: uniqueArtwork.imageUrl,
        });
      } else if (tag.artworks.length > 0) {
        // กรณีเลวร้ายที่สุด: ทุกรูปใน Tag นี้ถูก Tag อื่นแย่งไปหมดแล้ว
        // ให้ยอมใช้รูปแรกของมัน (ยอมซ้ำดีกว่าไม่มีรูป)
        formattedTags.push({
          tag: tag.name,
          img: tag.artworks[0].imageUrl,
        });
      }
    }

    return NextResponse.json(formattedTags);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}
