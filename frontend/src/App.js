import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";

function App() {

  const editorRef = useRef(null);

  const [code, setCode] = useState("// Write or paste your code here");
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({
          code,
          language
        })
      });

      const data = await response.json();

      setResult(data.result || "No AI response returned.");

    } catch (error) {
      setResult("Error connecting to AI service.");
    }

    setLoading(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setResult(prev => prev + "\n\n✅ Copied!");
  };

  return (

    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>AI Code Debugger</div>
        <div style={styles.owner}>Built by <b>Shubham Prajapati</b></div>
      </header>

      {/* MAIN */}
      <div style={styles.mainLayout}>

        {/* CONTROLS */}
        <div style={styles.controls}>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.select}
          >
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

          <button
            onClick={analyzeCode}
            style={styles.button}
            disabled={loading}
          >
            {loading ? "🔄 Analyzing..." : "🚀 Analyze Code"}
          </button>

        </div>

        {/* SPLIT LAYOUT */}
        <div style={styles.splitContainer}>

          {/* LEFT - EDITOR */}
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

          {/* RIGHT - RESULT */}
          <div style={styles.rightPane}>

            <div style={styles.resultHeader}>
              <h3>AI Debug Result</h3>

              {result && (
                <button onClick={copyResult} style={styles.copyButton}>
                  Copy
                </button>
              )}
            </div>

            <pre style={styles.resultBox}>
              {result || "AI response will appear here..."}
            </pre>

          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © 2026 Shubham Prajapati • AI Code Debugger Project
      </footer>

    </div>
  );
}

const styles = {

  page: {
    fontFamily: "Arial",
    background: "#f4f6f9",
    height: "100vh",
    display: "flex",
    flexDirection: "column"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#111",
    color: "white"
  },

  logo: {
    fontSize: "18px",
    fontWeight: "bold"
  },

  owner: {
    fontSize: "14px"
  },

  mainLayout: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "15px"
  },

  controls: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    position: "sticky",
    top: 0,
    background: "#f4f6f9",
    zIndex: 10,
    padding: "10px 0"
  },

  select: {
    padding: "8px"
  },

  button: {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  splitContainer: {
    display: "flex",
    gap: "10px",
    flex: 1
  },

  leftPane: {
    flex: 1.2,
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #ddd"
  },

  rightPane: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#0d1117",
    borderRadius: "8px",
    padding: "10px",
    color: "#c9d1d9"
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  copyButton: {
    padding: "5px 10px",
    cursor: "pointer"
  },

  resultBox: {
    flex: 1,
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    marginTop: "10px"
  },

  footer: {
    textAlign: "center",
    padding: "10px",
    background: "#111",
    color: "white",
    fontSize: "13px"
  }

};

export default App;