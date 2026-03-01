const fs = require('fs');
const path = require('path');

// --- ตั้งค่าโฟลเดอร์ ---
const folder0000 = path.join('prepare-data', 'images', '0000');
const jsonFolder = path.join('prepare-data', 'metadata');
const outputImgFolder = path.join('prepare-data', 'test_images'); // โฟลเดอร์เก็บรูป 100 รูป
const outputJsonFile = path.join('prepare-data', 'test_metadata.json'); // ไฟล์ JSON สรุป

async function prepareData() {
  console.log('1. กำลังอ่านรายชื่อรูปภาพจากโฟลเดอร์ 0000...');
  
  // ดึงชื่อไฟล์รูปมาแค่ 100 ไฟล์แรก
  const allFiles = fs.readdirSync(folder0000).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  const targetFiles = allFiles.slice(0, 2213);
  
  // ดึงแค่ตัวเลข ID (ตัด .jpg ออก)
  const targetIds = new Set(targetFiles.map(f => f.split('.')[0]));
  console.log(`-> ได้เป้าหมายมา ${targetIds.size} IDs`);

  console.log('2. กำลังค้นหาข้อมูลในไฟล์ JSON ทั้งหมด...');
  const matchedData = [];
  const jsonFiles = fs.readdirSync(jsonFolder).filter(f => f.endsWith('.json') || f.endsWith('.jsonl'));

  // วนลูปอ่านไฟล์ JSON ทีละไฟล์
  for (const file of jsonFiles) {
    const filePath = path.join(jsonFolder, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Dataset พวกนี้มักจะเป็น JSON Lines (1 บรรทัด = 1 ข้อมูล)
    const lines = content.split('\n'); 
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const obj = JSON.parse(line);
        // ถ้า ID ใน JSON ตรงกับ ID รูปที่เราต้องการ ให้เก็บไว้
        if (targetIds.has(obj.id)) {
          matchedData.push(obj);
        }
      } catch (error) {
        // ข้ามบรรทัดที่พังไป
      }
    }
  }

  console.log(`-> ค้นหาสำเร็จ! เจอข้อมูล Metadata ทั้งหมด ${matchedData.length} รายการ`);

  console.log('3. กำลังสร้างโฟลเดอร์และคัดลอกรูปภาพ...');
  if (!fs.existsSync(outputImgFolder)) {
    fs.mkdirSync(outputImgFolder);
  }

  // ก๊อปปี้รูป 100 รูปไปไว้ที่ใหม่
  for (const file of targetFiles) {
    fs.copyFileSync(path.join(folder0000, file), path.join(outputImgFolder, file));
  }

  // สร้างไฟล์ JSON ใหม่ที่รวมแค่ 100 รูป
  fs.writeFileSync(outputJsonFile, JSON.stringify(matchedData, null, 2));
  console.log('-> บันทึกไฟล์ test_metadata.json สำเร็จ!');
  
  console.log('🎉 เสร็จสิ้นกระบวนการทั้งหมด! พร้อมเอาไปใช้กับ Prisma แล้ว');
}

prepareData();