export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const apiURL = process.env.NEXT_PUBLIC_APPSCRIPT_URL;
  
      const response = await fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deletePO",
          ...req.body,
        }),
      });
  
      const data = await response.json();
      return res.status(200).json(data);
  
    } catch (err) {
      return res.status(500).json({ error: "Proxy deletePO error" });
    }
  }
  