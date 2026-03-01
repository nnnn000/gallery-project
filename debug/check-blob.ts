import * as dotenv from "dotenv";
dotenv.config();

import { list, ListBlobResult } from "@vercel/blob";

async function checkTotalFiles() {
  console.log("⏳ กำลังนับจำนวนไฟล์บน Vercel Blob...");

  let totalFiles = 0;
  let hasMore = true;
  let cursor: string | undefined = undefined;

  try {
    // วนลูปนับไฟล์จนกว่าจะหมด (รองรับกรณีมีไฟล์เกิน 1,000 รูป)
    while (hasMore) {
      const listResult: ListBlobResult = await list({
        cursor: cursor,
        limit: 1000,
      });

      totalFiles += listResult.blobs.length;
      cursor = listResult.cursor;
      hasMore = listResult.hasMore;
    }

    console.log(`\n==================================`);
    console.log(`📊 ตอนนี้มีไฟล์บน Vercel ทั้งหมด: ${totalFiles} ไฟล์`);
    console.log(`==================================\n`);
  } catch (error) {
    console.error(
      "❌ ไม่สามารถดึงข้อมูลได้ เช็ค Token ในไฟล์ .env ดูนะครับ",
      error,
    );
  }
}

checkTotalFiles();
