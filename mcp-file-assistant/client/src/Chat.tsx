import { useEffect, useState } from "react";
import { listTools, callTool } from "./McpClient";

// ponytail: no LLM-driven tool selection here (that needs an API key this
// scaffold doesn't have) — pick a tool + type JSON args by hand. Wire an
// LLM call in here (send user text + these tool schemas, get back a tool
// call) once you have a model endpoint to call.
export default function Chat() {
  const [tools, setTools] = useState<{ name: string; description?: string }[]>([]);
  const [selected, setSelected] = useState("");
  const [argsText, setArgsText] = useState("{}");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    listTools()
      .then((t) => {
        setTools(t);
        if (t[0]) setSelected(t[0].name);
      })
      .catch((e) => setError(String(e)));
  }, []);

  async function run() {
    setError("");
    setResult("");
    try {
      const args = JSON.parse(argsText);
      const res = await callTool(selected, args);
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "2rem auto" }}>
      <h2>MCP file assistant</h2>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        {tools.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
      <textarea
        value={argsText}
        onChange={(e) => setArgsText(e.target.value)}
        rows={4}
        style={{ width: "100%", marginTop: 8, fontFamily: "monospace" }}
      />
      <button onClick={run} style={{ marginTop: 8 }}>
        Call tool
      </button>
      {error && <pre style={{ color: "crimson" }}>{error}</pre>}
      {result && <pre>{result}</pre>}
    </div>
  );
}
