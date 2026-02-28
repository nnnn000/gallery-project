import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as path from "path";
import { put } from "@vercel/blob";

async function uploadFolder() {
  // กำหนด Path ที่คุณต้องการ
  const folderPath =
    "D:/Job/Project for apply job/gallery project/fetch_img_and_json/prepare-data/test_images";

  // เช็คก่อนว่า Path นี้มีอยู่จริงไหม
  if (!fs.existsSync(folderPath)) {
    console.error(
      "❌ ไม่พบโฟลเดอร์ใน Path ที่ระบุ กรุณาตรวจสอบชื่อโฟลเดอร์อีกครั้ง",
    );
    return;
  }

  const files = fs.readdirSync(folderPath);
  console.log(`🚀 พบไฟล์ในโฟลเดอร์ทั้งหมด ${files.length} ไฟล์`);

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    // ตรวจสอบว่าเป็นไฟล์รูปภาพจริงไหม
    if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
      try {
        const fileBuffer = fs.readFileSync(filePath);

        // อัปโหลดขึ้น Vercel Blob
        const blob = await put(file, fileBuffer, {
          access: "public", // 👈 เปิดให้คนนอกดูได้ (แก้ปัญหา Forbidden)
          addRandomSuffix: false, // 👈 ใช้ชื่อไฟล์เดิม (1066000.jpg)
        });

        console.log(`✅ อัปโหลดสำเร็จ: ${file} -> ${blob.url}`);
      } catch (error) {
        console.error(`❌ อัปโหลดไฟล์ ${file} ไม่สำเร็จ:`, error);
      }
    }
  }
}

uploadFolder();
