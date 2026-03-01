import * as dotenv from "dotenv";
dotenv.config();

import { list, ListBlobResult } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";

async function syncBlobToData() {
  console.log("⏳ กำลังเชื่อมต่อกับ Blob Storage และดึงข้อมูลไฟล์ทั้งหมด...");

  try {
    // 💡 1. ดึงรายชื่อไฟล์ทั้งหมดจาก Blob โดยใช้ Loop (กวาดมาให้หมดแม้จะเกิน 1,000 ไฟล์)
    let allBlobs: any[] = [];
    let hasMore = true;
    let cursor: string | undefined = undefined;

    while (hasMore) {
      const result: ListBlobResult = await list({
        cursor: cursor,
        limit: 1000,
      });

      // เอาข้อมูลรอบนี้ไปต่อท้าย Array รวม
      allBlobs = allBlobs.concat(result.blobs);
      cursor = result.cursor;
      hasMore = result.hasMore;
    }

    console.log(
      `✅ ดึงข้อมูลสำเร็จ! พบไฟล์บน Vercel ทั้งหมด ${allBlobs.length} รายการ`,
    );

    // 2. อ่านไฟล์ JSON ต้นฉบับที่คุณมีอยู่
    const jsonPath = path.join(process.cwd(), "db", "test_metadata.json");
    const artworks = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    // 3. วนลูปเพื่อเอา URL ไปใส่ใน JSON
    let nullCount = 0; // ตัวนับว่ามีรูปไหนหา URL ไม่เจอบ้าง

    const updatedArtworks = artworks.map((artwork: any) => {
      // หาไฟล์ใน allBlobs ที่ชื่อไฟล์ (pathname) ตรงกับ ID ของรูป
      const targetBlob = allBlobs.find((b) =>
        b.pathname.includes(artwork.id.toString()),
      );

      if (!targetBlob) nullCount++; // บันทึกสถิติถ้าหาไม่เจอ

      return {
        ...artwork,
        image_url: targetBlob ? targetBlob.url : null,
      };
    });

    // 4. บันทึกเป็นไฟล์ใหม่ที่พร้อมสำหรับ Seed
    const outputPath = path.join(
      process.cwd(),
      "db",
      "test_metadata_with_urls.json",
    );
    fs.writeFileSync(outputPath, JSON.stringify(updatedArtworks, null, 2));

    console.log(`✅ อัปเดตไฟล์สำเร็จ: ${outputPath}`);
    if (nullCount > 0) {
      console.log(
        `⚠️ คำเตือน: มีข้อมูล ${nullCount} รายการที่หา URL ไม่เจอ (จะเป็นค่า null)`,
      );
    } else {
      console.log(`🌟 สมบูรณ์ 100%! ไม่มีค่า null หลุดรอดไปได้`);
    }
    console.log(
      `💡 ตอนนี้คุณสามารถใช้ไฟล์นี้รันคำสั่ง seed ลง Database ได้แล้วครับ`,
    );
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
  }
}

syncBlobToData();
