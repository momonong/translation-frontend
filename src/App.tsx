import { useEffect, useState } from "react";
import { RelatedTerms } from "./components/RelatedTerms";

type RelationItem = {
  source: string;
  target: string;
  weight: number;
};

type RelationGroup = {
  relation: string;
  items: RelationItem[];
};

function App() {
  const [inputText, setInputText] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [relationGroups, setRelationGroups] = useState<RelationGroup[]>([]);
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
    if (term === selectedTerm) return;

    setSelectedTerm(term);
    setRelationGroups([]);
    setIsLoading(true);

    fetch(`http://localhost:8000/api/related_terms?term=${term}`)
      .then((res) => res.json())
      .then((data) => {
        setRelationGroups(data.groups);
        setError(null);
      })
      .catch(() => setError("❌ 查詢語意關係失敗"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div style={{ padding: "1.5rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔍 選取文字：</h1>
      <p style={{ marginBottom: "1rem", background: "#f8f8f8", padding: "0.75rem", borderRadius: "8px" }}>
        {inputText}
      </p>

      {isLoading && <p>⏳ 載入中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isLoading && keywords.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h2>🧠 擷取關鍵詞：</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {keywords.map((kw, idx) => (
              <button
                key={idx}
                onClick={() => fetchRelations(kw)}
                style={{
                  backgroundColor: "#e0f2ff",
                  border: "1px solid #90caf9",
                  borderRadius: "6px",
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer"
                }}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTerm && relationGroups.length > 0 && (
        <RelatedTerms term={selectedTerm} groups={relationGroups} onTermClick={fetchRelations} />
      )}
    </div>
  );
}

export default App;
