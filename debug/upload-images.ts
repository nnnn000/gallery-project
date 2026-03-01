import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as path from "path";
// 💡 เพิ่มคำสั่ง list เข้ามา
import { put, list, ListBlobResult } from "@vercel/blob";

async function uploadFolder() {
  const folderPath =
    "D:/Job/Project for apply job/gallery project/fetch_img_and_json/prepare-data/test_images";

  if (!fs.existsSync(folderPath)) {
    console.error(
      "❌ ไม่พบโฟลเดอร์ใน Path ที่ระบุ กรุณาตรวจสอบชื่อโฟลเดอร์อีกครั้ง",
    );
    return;
  }

  console.log("⏳ กำลังตรวจสอบไฟล์ที่มีอยู่แล้วบน Vercel Blob...");

  // 💡 1. ดึงรายชื่อไฟล์ทั้งหมดจาก Vercel
  const existingFiles = new Set<string>();
  let hasMore = true;
  let cursor: string | undefined = undefined;

  try {
    // ใช้ Loop เผื่อกรณีที่คุณมีไฟล์บน Vercel เกิน 1,000 ไฟล์ (Pagination)
    while (hasMore) {
      const listResult: ListBlobResult = await list({
        cursor: cursor,
        limit: 1000,
      });

      for (const blob of listResult.blobs) {
        // ดึงเฉพาะชื่อไฟล์ออกมา (เช่น จาก "folders/10000.jpg" ให้เหลือแค่ "10000.jpg")
        const fileName = path.basename(blob.pathname);
        existingFiles.add(fileName);
      }

      cursor = listResult.cursor;
      hasMore = listResult.hasMore;
    }

    console.log(
      `\n📊 สรุปข้อมูลบน Vercel: ตอนนี้มีไฟล์บน Vercel ทั้งหมด ${existingFiles.size} ไฟล์\n`,
    );
  } catch (error) {
    console.error(
      "❌ ดึงข้อมูลจาก Vercel ไม่สำเร็จ ตรวจสอบ Token ใน .env ด้วยครับ:",
      error,
    );
    return;
  }

  // 💡 2. อ่านไฟล์ในโฟลเดอร์เครื่องเรา
  const files = fs.readdirSync(folderPath).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });
  console.log(`📂 พบไฟล์ในโฟลเดอร์เครื่องเราทั้งหมด ${files.length} ไฟล์\n`);

  // 💡 3. เริ่มกระบวนการอัปโหลด
  let uploadCount = 0;
  let skipCount = 0;

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
      // 💡 4. เช็คแบบ Offline เลยว่าไฟล์นี้มีบน Vercel หรือยัง
      if (existingFiles.has(file)) {
        console.log(`⏭️ ข้ามไฟล์: ${file} (มีอยู่แล้วบน Vercel)`);
        skipCount++;
        continue; // ข้ามไปไฟล์ต่อไปทันทีโดยไม่เสีย API
      }

      // ถ้าไม่มีไฟล์นี้บน Vercel ถึงจะอัปโหลด
      const filePath = path.join(folderPath, file);
      try {
        const fileBuffer = fs.readFileSync(filePath);

        const blob = await put(file, fileBuffer, {
          access: "public",
          addRandomSuffix: false,
        });

        console.log(`✅ อัปโหลดสำเร็จ: ${file} -> ${blob.url}`);
        uploadCount++;
      } catch (error: any) {
        console.error(`❌ อัปโหลดไฟล์ ${file} ไม่สำเร็จ:`, error.message);
      }
    }
  }

  console.log("\n==================================");
  console.log(`🎉 ทำงานเสร็จสิ้น!`);
  console.log(`อัปโหลดใหม่: ${uploadCount} ไฟล์`);
  console.log(`ข้ามไฟล์เก่า: ${skipCount} ไฟล์`);
  console.log("==================================\n");
}

uploadFolder();
