import redis from "../../lib/redis";

// 查询 hash
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
      // 下载由前端调用 /api/download/:hash 代理，不直接返回 VT URL
      download_url: `/api/download/${hash}`
    });

  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      detail: e.toString()
    });
  }
}

// 新增下载接口
export async function downloadHandler(req, res) {
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

    // 将 VT 文件流直接返回给前端
    res.setHeader("Content-Disposition", `attachment; filename="${hash}"`);
    response.body.pipe(res);

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
