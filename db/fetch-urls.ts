import * as dotenv from "dotenv";
dotenv.config();

import { list } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";

async function syncBlobToData() {
  console.log("กำลังเชื่อมต่อกับ Blob Storage...");

  try {
    // 1. ดึงรายชื่อไฟล์ทั้งหมดจาก Blob
    // หมายเหตุ: list() ดึงได้ครั้งละ 1,000 ไฟล์ ถ้ามีเยอะกว่านั้นต้องใช้ cursor
    const { blobs } = await list();

    console.log(`ดึงข้อมูลสำเร็จ! พบไฟล์ทั้งหมด ${blobs.length} รายการ`);

    // 2. อ่านไฟล์ JSON ต้นฉบับที่คุณมีอยู่
    const jsonPath = path.join(process.cwd(), "db", "test_metadata.json");
    const artworks = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    // 3. วนลูปเพื่อเอา URL ไปใส่ใน JSON
    const updatedArtworks = artworks.map((artwork: any) => {
      // หาไฟล์ใน blobs ที่ชื่อไฟล์ (pathname) ตรงกับ ID ของรูป
      // เช่น artwork.id = 1066000 ให้หาไฟล์ที่ชื่อมีคำว่า 1066000
      const targetBlob = blobs.find((b) =>
        b.pathname.includes(artwork.id.toString()),
      );

      return {
        ...artwork,
        image_url: targetBlob ? targetBlob.url : null, // ถ้าเจอให้ใส่ URL ถ้าไม่เจอให้ใส่ null
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
    console.log(`💡 ตอนนี้คุณสามารถใช้ไฟล์นี้ใน seed.ts ได้แล้วครับ`);
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
  }
}

syncBlobToData();
