import { useState } from "react";

export default function Home() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);

  const submit = async () => {
    const resp = await fetch("/api/vt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash })
    });

    const data = await resp.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "90%", margin: "0 auto" }}>
      <h1>VirusTotal 查询</h1>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
        <input
          value={hash}
          onChange={e => setHash(e.target.value)}
          placeholder="输入文件 hash"
          style={{ flex: "1 1 300px", maxWidth: "600px", padding: "8px", fontSize: "16px" }}
        />
        <button onClick={submit} style={{ padding: "8px 14px", fontSize: "16px" }}>
          查询
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "20px", maxWidth: "800px" }}>
          <h3>查询结果</h3>
          <pre
            style={{
              background: "#222",
              color: "#fff",
              padding: "10px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(result.vt, null, 2)}
          </pre>

          {/* 改动的关键：调用自己后端的下载接口 */}
          {result.vt && result.vt.data?.id && (
            <a
              href={`/api/download/${result.vt.data.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: "10px", color: "#0070f3" }}
            >
              下载文件（如果API权限允许）
            </a>
          )}
        </div>
      )}
    </div>
  );
}
