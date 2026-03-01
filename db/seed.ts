import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 เริ่มต้นกระบวนการ Seed...");

  const jsonPath = path.join(
    process.cwd(),
    "db",
    "test_metadata_with_urls.json",
  );

  if (!fs.existsSync(jsonPath)) {
    console.error("❌ ไม่พบไฟล์ JSON ที่ระบุ!");
    return;
  }

  console.log("📖 กำลังอ่านไฟล์ JSON...");
  const artworks = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`📊 พบข้อมูลทั้งหมด ${artworks.length} รายการ`);

  let count = 0;
  let skippedCount = 0;
  let updatedCount = 0;

  for (const item of artworks) {
    count++;

    try {
      // 💡 1. ให้ Prisma แอบไปส่องดูใน DB ก่อนว่า ID นี้มีอยู่หรือยัง
      // (ใช้ select ให้ดึงมาแค่ imageUrl จะได้ไม่กินแรม)
      const existingArtwork = await prisma.artwork.findUnique({
        where: { id: BigInt(item.id) },
        select: { imageUrl: true },
      });

      // 💡 2. เช็คเงื่อนไข: ถ้ามีข้อมูลนี้ใน DB แล้ว "และ" imageUrl ไม่ใช่ null ให้ข้ามเลย!
      if (existingArtwork && existingArtwork.imageUrl !== null) {
        // console.log(`⏭️ ข้าม ID: ${item.id} -> มี URL ในฐานข้อมูลแล้ว`); // (เปิดคอมเมนต์นี้ถ้าอยากเห็น Log การข้าม)
        skippedCount++;
        continue; // กระโดดข้ามไปทำรอบถัดไปทันที
      }

      // แสดง Log แจ้งเตือนสถานะสำหรับตัวที่จะอัปเดตจริงๆ
      if (updatedCount % 10 === 0 || updatedCount === 1) {
        console.log(
          `⏳ กำลังอัปเดต/สร้าง ID: ${item.id} (รายการที่ ${count}/${artworks.length})`,
        );
      }

      // 💡 3. ถ้าไม่มีข้อมูลใน DB หรือ imageUrl ยังเป็น null อยู่ โค้ดส่วนนี้ถึงจะทำงาน
      await prisma.artwork.upsert({
        where: { id: BigInt(item.id) },
        update: {
          imageUrl: item.image_url,
          score: parseInt(item.score),
        },
        create: {
          id: BigInt(item.id),
          imageUrl: item.image_url,
          uploadedAt: new Date(item.created_at),
          uploaderId: BigInt(item.uploader_id),
          score: parseInt(item.score),
          source: item.source,
          md5: item.md5,
          rating: item.rating,
          imageWidth: parseInt(item.image_width),
          imageHeight: parseInt(item.image_height),
          fileExt: item.file_ext,
          fileSize: parseInt(item.file_size),
          pixivId: item.pixiv_id ? BigInt(item.pixiv_id) : null,
          tags: {
            connectOrCreate: item.tags.map((tag: any) => ({
              where: { id: BigInt(tag.id) },
              create: {
                id: BigInt(tag.id),
                name: tag.name,
                category: parseInt(tag.category),
              },
            })),
          },
        },
      });

      updatedCount++;
    } catch (err) {
      console.error(`❌ ผิดพลาดที่ ID ${item.id}:`, err);
    }
  }

  console.log("\n==================================");
  console.log("✅ Seed ข้อมูลเสร็จสิ้น!");
  console.log(`อัปเดต/เพิ่มใหม่สำเร็จ: ${updatedCount} รายการ`);
  console.log(`ข้าม (มีรูปใน DB แล้ว): ${skippedCount} รายการ`);
  console.log("==================================\n");
}

main()
  .catch((e) => {
    console.error("💥 Global Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 ปิดการเชื่อมต่อ Database");
  });
