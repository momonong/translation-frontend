import { useEffect, useState } from "react";
import { Box, Typography, Chip, CircularProgress, Alert, Paper } from "@mui/material";
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
      fetchKeywords(decoded);
    }
  }, []);

  const fetchKeywords = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/keywords?text=${encodeURIComponent(text)}`);
      const data = await res.json();
      setKeywords(data.keywords);
    } catch {
      setError("❌ 擷取關鍵詞失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelations = async (term: string) => {
    setSelectedTerm(term);
    setRelationGroups([]);
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/related_terms?term=${encodeURIComponent(term)}`);
      const data = await res.json();
      setRelationGroups(data.groups);
    } catch {
      setError("❌ 查詢語意關係失敗");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", margin: "0 auto", padding: 4 }}>
      <Typography variant="h5" gutterBottom>🔍 選取文字：</Typography>
      <Paper variant="outlined" sx={{ padding: 2, marginBottom: 3 }}>
        <Typography>{inputText}</Typography>
      </Paper>

      {isLoading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

      {keywords.length > 0 && (
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h6" gutterBottom>🧠 擷取關鍵詞：</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {keywords.map((kw, idx) => (
              <Chip
                key={idx}
                label={kw}
                color="primary"
                onClick={() => fetchRelations(kw)}
                clickable
              />
            ))}
          </Box>
        </Box>
      )}

      {selectedTerm && relationGroups.length > 0 && (
        <RelatedTerms term={selectedTerm} groups={relationGroups} onTermClick={fetchRelations} />
      )}
    </Box>
  );
}

export default App;
