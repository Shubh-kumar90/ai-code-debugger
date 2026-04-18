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

        <div style={styles.logo}>
          AI Code Debugger
        </div>

        <div style={styles.owner}>
          Built by <b>Shubham Prajapati</b>
        </div>

      </header>

      {/* MAIN */}

      <main style={styles.container}>

        <h1 style={styles.title}>
          AI Code Debugger
        </h1>

        <p style={styles.subtitle}>
          Paste your code and let AI detect bugs and suggest fixes.
        </p>

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

        {/* MONACO EDITOR */}

        <div style={styles.editorContainer}>

          <Editor
            height="420px"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "on"
            }}
          />

        </div>

        {/* RESULT */}

        <div style={styles.resultContainer}>

          <div style={styles.resultHeader}>

            <h3>AI Debug Result</h3>

            {result && (
              <button onClick={copyResult} style={styles.copyButton}>
                Copy
              </button>
            )}

          </div>

          <pre style={{ ...styles.result, background: "#0d1117", color: "#c9d1d9" }}>
            {result || "AI response will appear here..."}
          </pre>

        </div>

      </main>

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
    minHeight: "100vh",
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

  container: {
    maxWidth: "950px",
    margin: "auto",
    padding: "40px"
  },

  title: {
    textAlign: "center"
  },

  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: "25px"
  },

  controls: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
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

  editorContainer: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflow: "hidden"
  },

  resultContainer: {
    marginTop: "20px"
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

  result: {
    background: "#f5f5f5",
    padding: "15px",
    borderRadius: "5px",
    whiteSpace: "pre-wrap",
    fontFamily: "monospace"
  },

  footer: {
    textAlign: "center",
    padding: "15px",
    marginTop: "auto",
    background: "#111",
    color: "white",
    fontSize: "13px"
  }

};

export default App;