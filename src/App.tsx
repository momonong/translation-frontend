import { useEffect, useState } from "react";
import { Typography, CircularProgress, Alert, Box } from "@mui/material";
import { RelatedTerms } from "./components/RelatedTerms";
import { HighlightedText } from "./components/HighlightedText";
import { API_BASE_URL } from "./config";

type RelationItem = { source: string; target: string; weight: number };
type RelationGroup = { relation: string; items: RelationItem[] };

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
      fetch(`${API_BASE_URL}/api/keywords?text=${encodeURIComponent(decoded)}`)
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
    setRelationGroups([]);
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/related_terms?term=${term}`)
      .then((res) => res.json())
      .then((data) => {
        setRelationGroups(data.groups);
        setError(null);
      })
      .catch(() => setError("❌ 查詢語意關係失敗"))
      .finally(() => setIsLoading(false));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 4, px: 2 }}>
      <Typography variant="h5" gutterBottom>🔍 選取文字：</Typography>
      <Box sx={{ bgcolor: "#f3f3f3", p: 2, borderRadius: 2, mb: 3 }}>
        <HighlightedText text={inputText} keywords={keywords} onClick={fetchRelations} />
      </Box>

      {isLoading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {selectedTerm && relationGroups.length > 0 && (
        <RelatedTerms term={selectedTerm} groups={relationGroups} onTermClick={fetchRelations} />
      )}
    </Box>
  );
}

export default App;
