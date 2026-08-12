import { reviewSubmissionWithAI } from "../src/lib/gemini";
import * as fs from "fs";
import * as path from "path";

// Native .env parser
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return;
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const parts = trimmed.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join("=").trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  } catch (e) {
    console.error("Gagal memuat file .env:", e);
  }
}

loadEnv();

async function runTest() {
  console.log("=========================================");
  console.log("       ROVECLIP GROQ API VALIDATOR       ");
  console.log("=========================================");
  
  const key = process.env.GROQ_API_KEY;
  console.log(`Target Key: ${key ? key.substring(0, 8) + "..." : "TIDAK DITEMUKAN"}`);

  if (!key) {
    console.error("ERROR: GROQ_API_KEY tidak terdeteksi di .env!");
    process.exit(1);
  }

  console.log("\n[TEST 1] Mengirim Konten Relevan (Harus APPROVED)...");
  try {
    const res1 = await reviewSubmissionWithAI(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "Video Promosi Sepatu Nike Air Max Terbaru",
      "Mencoba sepatu Nike Air Max terbaru! Empuk banget dipake lari pagi. #Nike #Rove123456",
      "https://www.tiktok.com/@clipper/video/9991",
      "TIKTOK"
    );
    console.log("Hasil Test 1:", JSON.stringify(res1, null, 2));
  } catch (e) {
    console.error("Test 1 Gagal:", e);
  }

  console.log("\n[TEST 2] Mengirim Konten Tidak Relevan/Spam (Harus FLAGGED/REJECTED)...");
  try {
    const res2 = await reviewSubmissionWithAI(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "Video Promosi Sepatu Nike Air Max Terbaru",
      "Cara membuat nasi goreng gila pedas manis spesial di rumah! #cooking #recipe #Rove123456",
      "https://www.tiktok.com/@clipper/video/9992",
      "TIKTOK"
    );
    console.log("Hasil Test 2:", JSON.stringify(res2, null, 2));
  } catch (e) {
    console.error("Test 2 Gagal:", e);
  }
}

runTest();
