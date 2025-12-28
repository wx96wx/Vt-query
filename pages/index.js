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
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>VirusTotal 查询</h1>
      <input 
        value={hash}
        onChange={e => setHash(e.target.value)}
        placeholder="输入文件 hash"
        style={{ width: "300px", padding: "8px" }}
      />
      <button onClick={submit} style={{ padding: "8px 14px", marginLeft: "10px" }}>
        查询
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>查询结果</h3>
          <pre style={{ background: "#222", color: "#fff", padding: "10px" }}>
            {JSON.stringify(result.vt, null, 2)}
          </pre>
          <a href={result.download_url} target="_blank">
            下载文件（如果API权限允许）
          </a>
        </div>
      )}
    </div>
  );
}
