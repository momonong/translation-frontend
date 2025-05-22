import { useEffect, useState } from "react";

type Relation = {
  source: string;
  relation: string;
  target: string;
  weight: number;
};

function App() {
  const [inputText, setInputText] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get("text");
    if (text) {
      const decoded = decodeURIComponent(text);
      setInputText(decoded);
      setIsLoading(true);

      fetch(`http://localhost:8000/api/keywords?text=${encodeURIComponent(decoded)}`)
        .then((res) => res.json())
        .then((data) => {
          setKeywords(data.keywords);
          setError(null);
        })
        .catch(() => setError("❌ 擷取關鍵詞失敗"))
        .finally(() => setIsLoading(false));
    }
  }, []);

  const fetchRelations = (term: string) => {
    setSelectedTerm(term);
    setRelations([]);
    setIsLoading(true);
    fetch(`http://localhost:8000/api/related_terms?term=${term}`)
      .then((res) => res.json())
      .then((data) => {
        setRelations(data.results);
        setError(null);
      })
      .catch(() => setError("❌ 查詢語意關係失敗"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>🔍 選取文字：</h1>
      <p>{inputText}</p>

      {isLoading && <p>⏳ 載入中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isLoading && keywords.length > 0 && (
        <>
          <h2>🧠 擷取關鍵詞：</h2>
          <ul>
            {keywords.map((kw, idx) => (
              <li
                key={idx}
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => fetchRelations(kw)}
              >
                🔗 {kw}
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedTerm && relations.length > 0 && (
        <>
          <h2>📌 {selectedTerm} 的語意關係：</h2>
          <ul>
            {relations.map((r, idx) => (
              <li key={idx}>
                {`${r.source} --[${r.relation} (${r.weight.toFixed(2)})]--> ${r.target}`}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
