import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {

  const editorRef = useRef(null);

  const [code, setCode] = useState("// Write or paste your code here");
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("debugHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const analyzeCode = async () => {
    if (!code) {
      alert("Please paste some code");
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
        body: JSON.stringify({ code, language })
      });

      const data = await response.json();
      const resText = data.result || "No AI response returned.";

      setResult(resText);

      const newHistory = [
        { code, language, result: resText },
        ...history
      ];

      setHistory(newHistory);
      localStorage.setItem("debugHistory", JSON.stringify(newHistory));

    } catch (error) {
      setResult("Error connecting to AI service.");
    }

    setLoading(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setResult(prev => prev + "\n\n✅ Copied!");
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "debug-result.txt";
    link.click();
  };

  const clearAll = () => {
    setCode("");
    setResult("");
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>AI Code Debugger</div>
        <div style={styles.owner}>Built by <b>Shubham Prajapati</b></div>
      </header>

      <div style={styles.mainLayout}>

        {/* CONTROLS */}
        <div style={styles.controls}>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.select}>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
          </select>

          <div>
            <button style={styles.primaryBtn} onClick={analyzeCode} disabled={loading}>
              {loading ? "🔄 Analyzing..." : "🚀 Analyze"}
            </button>
            <button style={styles.secondaryBtn} onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>

        {/* SPLIT UI */}
        <div style={styles.splitContainer}>

          {/* EDITOR */}
          <div style={styles.leftPane}>
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: "on"
              }}
            />
          </div>

          {/* RESULT */}
          <div style={styles.rightPane}>
            <div style={styles.resultHeader}>
              <h3>Result</h3>

              {result && (
                <div>
                  <button style={styles.smallBtn} onClick={copyResult}>Copy</button>
                  <button style={styles.smallBtn} onClick={downloadResult}>Download</button>
                </div>
              )}
            </div>

            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{ borderRadius: "8px", fontSize: "13px" }}
            >
              {result || "AI response will appear here..."}
            </SyntaxHighlighter>
          </div>

        </div>

        {/* HISTORY */}
        <div style={styles.historyBox}>
          <h3>History</h3>

          {history.map((item, index) => (
            <div
              key={index}
              style={styles.historyItem}
              onClick={() => {
                setCode(item.code);
                setResult(item.result);
                setLanguage(item.language);
              }}
              onMouseEnter={(e) => e.target.style.background = "#21262d"}
              onMouseLeave={(e) => e.target.style.background = "#161b22"}
            >
              {item.language.toUpperCase()}
            </div>
          ))}
        </div>

      </div>

      <footer style={styles.footer}>
        © 2026 Shubham Prajapati
      </footer>

    </div>
  );
}

const styles = {

  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f4f6f9"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#0d1117",
    color: "white",
    borderBottom: "1px solid #222"
  },

  logo: { fontWeight: "bold" },
  owner: { fontSize: "14px" },

  mainLayout: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  controls: {
    display: "flex",
    justifyContent: "space-between"
  },

  select: {
    padding: "8px",
    borderRadius: "6px"
  },

  primaryBtn: {
    background: "#238636",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    marginRight: "8px",
    cursor: "pointer"
  },

  secondaryBtn: {
    background: "#30363d",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  smallBtn: {
    padding: "5px 10px",
    marginLeft: "6px",
    borderRadius: "6px",
    border: "none",
    background: "#30363d",
    color: "white",
    cursor: "pointer"
  },

  splitContainer: {
    display: "flex",
    gap: "12px",
    flex: 1
  },

  leftPane: {
    flex: 1.2,
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #ddd",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },

  rightPane: {
    flex: 1,
    background: "#0d1117",
    borderRadius: "10px",
    padding: "12px",
    color: "#c9d1d9",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #222",
    paddingBottom: "8px",
    marginBottom: "8px"
  },

  historyBox: {
    background: "#0d1117",
    color: "white",
    padding: "12px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },

  historyItem: {
    padding: "8px",
    borderRadius: "6px",
    background: "#161b22",
    marginBottom: "6px",
    cursor: "pointer",
    transition: "0.2s"
  },

  footer: {
    textAlign: "center",
    background: "#0d1117",
    color: "white",
    padding: "6px"
  }

};

export default App;