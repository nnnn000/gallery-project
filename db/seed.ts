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
  for (const item of artworks) {
    count++;
    // แสดง Log ทุกๆ 10 รายการเพื่อไม่ให้รกหน้าจอ แต่ให้รู้ว่าเครื่องยังไม่ค้าง
    if (count % 10 === 0 || count === 1) {
      console.log(
        `⏳ กำลังจัดการรายการที่ ${count}/${artworks.length} (ID: ${item.id})`,
      );
    }

    try {
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
    } catch (err) {
      console.error(`❌ ผิดพลาดที่ ID ${item.id}:`, err);
    }
  }

  console.log("✅ Seed ข้อมูลเสร็จสิ้น!");
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
