import redis from "../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { hash } = req.body;
  if (!hash) {
    return res.status(400).json({ error: "Missing hash" });
  }

  try {
    // 从 Redis 获取 VirusTotal API key
    const apiKey = await redis.get(process.env.REDIS_KEY);
    if (!apiKey) {
      return res.status(500).json({ error: "VT API key missing in Redis" });
    }

    const url = `https://www.virustotal.com/api/v3/files/${hash}`;

    const resp = await fetch(url, {
      headers: { "x-apikey": apiKey }
    });

    const data = await resp.json();

    return res.status(200).json({
      hash,
      vt: data,
      download_url: `https://www.virustotal.com/api/v3/files/${hash}/download`
    });

  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      detail: e.toString()
    });
  }
}
