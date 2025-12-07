// lib/api.js
export async function apiPost(action, body = {}) {
  const payload = { action, ...body };

  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("RAW RESPONSE FROM SERVER:", text);

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error("Response bukan JSON: " + text);
  }

  return json; // bentuknya sama persis seperti dari Apps Script
}
