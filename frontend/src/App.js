// import { useState, useRef, useEffect } from "react";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {

  // const editorRef = useRef(null);
  const resultRef = useRef(null);

  const [code, setCode] = useState("// Write or paste your code here");
  const [language, setLanguage] = useState("javascript");
  const [mode, setMode] = useState("debug");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("debugHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    resultRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [result]);

  const analyzeCode = async () => {

    if (!code) {
      alert("Paste some code first");
      return;
    }

    setLoading(true);
    setResult("");

    try {

      const response = await fetch("https://ai-code-debugger-kojw.onrender.com/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, language, mode })
      });

      if (!response.ok) {
        setResult("⚠️ Server error. Try again.");
        return;
      }

      const data = await response.json();
      const resText = data.result || "No response";

      setResult(resText);

      const newHistory = [
        {
          code,
          language,
          mode,
          time: new Date().toLocaleTimeString(),
          result: resText
        },
        ...history
      ];

      setHistory(newHistory);
      localStorage.setItem("debugHistory", JSON.stringify(newHistory));

    } catch {
      setResult("❌ Failed to connect to server.");
    }

    setLoading(false);
  };

  const clearHistory = () => {
    localStorage.removeItem("debugHistory");
    setHistory([]);
  };

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <div>AI Developer Assistant</div>
        <div>Shubham Prajapati</div>
      </header>

      <div style={styles.mainLayout}>

        {/* CONTROLS */}
        <div style={styles.controls}>

          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JS</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="debug">🐞 Debug</option>
            <option value="explain">🧠 Explain</option>
            <option value="optimize">⚡ Optimize</option>
          </select>

          <button onClick={analyzeCode}>
            {loading ? "⏳ Thinking..." : "🚀 Run"}
          </button>

        </div>

        {/* EDITOR + RESULT */}
        <div style={styles.splitContainer}>

          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v)}
          />

          <div style={styles.resultBox}>
            <SyntaxHighlighter language={language} style={vscDarkPlus}>
              {result || "Result will appear here..."}
            </SyntaxHighlighter>
            <div ref={resultRef}></div>
          </div>

        </div>

        {/* HISTORY */}
        <div style={styles.historyBox}>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>History</h3>
            <button onClick={clearHistory}>Clear</button>
          </div>

          {history.map((item, i) => (
            <div
              key={i}
              style={styles.historyItem}
              onClick={() => {
                setCode(item.code);
                setResult(item.result);
                setLanguage(item.language);
                setMode(item.mode);
              }}
            >
              {item.mode} | {item.language} | {item.time}
              <br />
              <small>{item.code.slice(0, 50)}...</small>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

const styles = {
  page: { height: "100vh", display: "flex", flexDirection: "column" },
  header: { padding: "10px", background: "#111", color: "white" },
  mainLayout: { flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: "10px" },
  controls: { display: "flex", gap: "10px" },
  splitContainer: { display: "flex", flex: 1, gap: "10px" },
  resultBox: { flex: 1, background: "#0d1117", padding: "10px" },
  historyBox: { background: "#111", color: "white", padding: "10px" },
  historyItem: { padding: "6px", cursor: "pointer", borderBottom: "1px solid #333" }
};

export default App;