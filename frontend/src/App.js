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

  // Load history
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

      // Save history
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

      <header style={styles.header}>
        <div>AI Code Debugger</div>
        <div>Built by <b>Shubham Prajapati</b></div>
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
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
          </select>

          <div>
            <button onClick={analyzeCode} disabled={loading}>
              {loading ? "🔄 Analyzing..." : "🚀 Analyze"}
            </button>

            <button onClick={clearAll}>Clear</button>
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

              <div>
                {result && (
                  <>
                    <button onClick={copyResult}>Copy</button>
                    <button onClick={downloadResult}>Download</button>
                  </>
                )}
              </div>
            </div>

            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{ borderRadius: "8px" }}
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
  page: { height: "100vh", display: "flex", flexDirection: "column" },
  header: { padding: "10px", background: "#111", color: "white", display: "flex", justifyContent: "space-between" },
  mainLayout: { flex: 1, padding: "10px", display: "flex", flexDirection: "column" },
  controls: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  splitContainer: { display: "flex", flex: 1, gap: "10px" },
  leftPane: { flex: 1.2, border: "1px solid #ddd" },
  rightPane: { flex: 1, background: "#0d1117", padding: "10px", color: "white" },
  resultHeader: { display: "flex", justifyContent: "space-between" },
  historyBox: { marginTop: "10px", background: "#111", color: "white", padding: "10px" },
  historyItem: { cursor: "pointer", padding: "5px", borderBottom: "1px solid #333" },
  footer: { textAlign: "center", background: "#111", color: "white", padding: "5px" }
};

export default App;