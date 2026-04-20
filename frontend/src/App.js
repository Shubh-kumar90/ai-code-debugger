import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

function App() {

  const resultBoxRef = useRef(null);

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

  // ⚡ FAST SCROLL (no smooth lag)
  useEffect(() => {
    if (resultBoxRef.current) {
      resultBoxRef.current.scrollTop = 0;
    }
  }, [result]);

  const analyzeCode = async () => {

    if (!code.trim()) {
      alert("Paste some code first!");
      return;
    }

    setLoading(true);
    setResult("⏳ Thinking...");

    try {

      const response = await fetch("https://ai-code-debugger-kojw.onrender.com/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, language, mode })
      });

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

  const copyResult = () => {
    navigator.clipboard.writeText(result);
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ai-result.txt";
    link.click();
  };


  const getEditorLanguage = (lang) => {
  const map = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "csharp",
    html: "html",
    css: "css",
    json: "json",
    sql: "sql"
  };

  return map[lang] || "plaintext";
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
  <option value="javascript">JavaScript</option>
  <option value="typescript">TypeScript</option>
  <option value="python">Python</option>
  <option value="java">Java</option>
  <option value="cpp">C++</option>
  <option value="c">C</option>
  <option value="csharp">C#</option>
  <option value="go">Go</option>
  <option value="ruby">Ruby</option>
  <option value="php">PHP</option>
  <option value="swift">Swift</option>
  <option value="kotlin">Kotlin</option>
  <option value="rust">Rust</option>
  <option value="scala">Scala</option>
  <option value="sql">SQL</option>
  <option value="bash">Bash</option>
  <option value="html">HTML</option>
  <option value="css">CSS</option>
  <option value="json">JSON</option>
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

          {/* EDITOR */}
          <div style={styles.editor}>
            <Editor
  height="100%"
  language={getEditorLanguage(language)}
  theme="vs-dark"
  value={code}
  onChange={(v) => setCode(v)}
/>
          </div>

          {/* RESULT */}
          <div style={styles.resultContainer}>

            <div style={styles.resultHeader}>
              <h3>Result</h3>

              {result && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={copyResult}>Copy</button>
                  <button onClick={downloadResult}>Download</button>
                </div>
              )}
            </div>

            <div ref={resultBoxRef} style={styles.resultBox}>
              <pre style={styles.output}>
                {result || "Result will appear here..."}
              </pre>
            </div>

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

  mainLayout: {
    flex: 1,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  controls: { display: "flex", gap: "10px" },

  splitContainer: {
    display: "flex",
    flex: 1,
    gap: "10px",
    overflow: "hidden"
  },

  editor: {
    flex: 2
  },

  resultContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#0d1117"
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
    borderBottom: "1px solid #333",
    color: "white"
  },

  resultBox: {
    flex: 1,
    overflowY: "auto",
    padding: "10px"
  },

  output: {
    whiteSpace: "pre-wrap",
    fontSize: "13px",
    color: "#c9d1d9"
  },

  historyBox: {
    background: "#111",
    color: "white",
    padding: "10px",
    maxHeight: "200px",
    overflowY: "auto"
  },

  historyItem: {
    padding: "6px",
    cursor: "pointer",
    borderBottom: "1px solid #333"
  }
};

export default App;