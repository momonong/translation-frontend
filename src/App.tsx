import { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { RelatedTerms } from "./components/RelatedTerms";
import { HighlightedText } from "./components/HighlightedText";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import { TranslationPopover } from "./components/TranslationPopover";
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

  const [selectedText, setSelectedText] = useState("");
  const [popoverAnchor, setPopoverAnchor] = useState<{ top: number; left: number } | null>(null);

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

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const selection = window.getSelection();
      const selected = selection?.toString().trim();

      if (selection && selected) {
        e.preventDefault();

        try {
          const rect = selection.getRangeAt(0).getBoundingClientRect();
          setSelectedText(selected);
          setPopoverAnchor({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          });
        } catch {
          console.warn("❗ 無法取得選取區塊位置");
        }
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", p: 4, boxSizing: "border-box" }}>
      <Box sx={{ maxWidth: "1000px", mx: "auto", mb: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          🔍 選取文字：
        </Typography>
        <Box sx={{ bgcolor: "#f3f3f3", p: 2, borderRadius: 2 }}>
          <HighlightedText text={inputText} keywords={keywords} onClick={() => { }} />
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box sx={{ maxWidth: 800, mx: "auto", mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {selectedTerm && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            gap: 4,
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {relationGroups.length > 0 && (
              <RelatedTerms
                term={selectedTerm}
                groups={relationGroups}
                onTermClick={fetchRelations}
              />
            )}
          </Box>
          <Box sx={{ flex: 3, minWidth: 0 }}>
            {relationGroups.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  📈 知識圖譜視覺化：
                </Typography>
                <KnowledgeGraph term={selectedTerm} />
              </>
            )}
          </Box>
        </Box>
      )}

      <TranslationPopover
        anchor={popoverAnchor}
        text={selectedText}
        onClose={() => setPopoverAnchor(null)}
        onGraphClick={(term) => {
          setPopoverAnchor(null);
          fetchRelations(term);
        }}
      />
    </Box>
  );
}

export default App;
