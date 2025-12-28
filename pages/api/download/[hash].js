import redis from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  const { hash } = req.query;
  if (!hash) {
    return res.status(400).json({ error: "Missing hash" });
  }

  try {
    const apiKey = await redis.get(process.env.REDIS_KEY);
    if (!apiKey) {
      return res.status(500).json({ error: "VT API key missing in Redis" });
    }

    const vtUrl = `https://www.virustotal.com/api/v3/files/${hash}/download`;

    const response = await fetch(vtUrl, {
      headers: { "x-apikey": apiKey }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    // 返回文件流给前端
    res.setHeader("Content-Disposition", `attachment; filename="${hash}"`);
    response.body.pipe(res);

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
