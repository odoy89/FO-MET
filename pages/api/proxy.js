// pages/api/proxy.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ success: false, error: "Method not allowed, gunakan POST" });
    }
  
    const url = process.env.NEXT_PUBLIC_APPSCRIPT_URL;
  
    if (!url) {
      return res.status(500).json({
        success: false,
        error: "ENV NEXT_PUBLIC_APPSCRIPT_URL belum diset di .env.local",
      });
    }
  
    try {
      // teruskan body apa adanya ke Apps Script
      const gasRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // kita kirim JSON murni
        },
        body: JSON.stringify(req.body),
      });
  
      const text = await gasRes.text();
  
      let json;
      try {
        json = JSON.parse(text); // Apps Script sudah kirim JSON
      } catch (e) {
        // kalau bukan JSON, balikin error buat debug
        return res.status(500).json({
          success: false,
          error: "Response bukan JSON dari Apps Script",
          raw: text,
        });
      }
  
      return res.status(200).json(json);
    } catch (err) {
      console.error("Proxy error:", err);
      return res
        .status(500)
        .json({ success: false, error: String(err || "Unknown error") });
    }
  }
  