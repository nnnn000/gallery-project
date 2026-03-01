// app/api/tags/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30"); // เริ่มต้นที่ 30
  const skip = parseInt(searchParams.get("skip") || "0");

  try {
    const tags = await prisma.tag.findMany({
      take: limit,
      skip: skip,
      orderBy: { name: "asc" },
      // 💡 เปลี่ยนจาก include เป็น select เพื่อดึงเฉพาะข้อมูลที่จำเป็นจริงๆ
      select: {
        name: true,
        artworks: {
          take: 1, // ดึงแค่รูปเดียว
          select: {
            imageUrl: true, // และดึงเฉพาะ URL มาเลย ไม่ต้องดึง ID หรือฟิลด์อื่น
          },
        },
      },
    });

    const formattedTags = tags.map((t) => ({
      tag: t.name,
      img: t.artworks[0]?.imageUrl || "/placeholder.jpg",
    }));

    const jsonString = JSON.stringify(formattedTags, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    );

    return new Response(jsonString, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
