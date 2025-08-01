import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import RelatedTerms from "./components/RelatedTerms";
import HighlightedText from "./components/HighlightedText";
import KnowledgeGraph from "./components/KnowledgeGraph";
import PdfUploader from "./components/PdfUploader"; // ← 換這個
import { API_BASE_URL } from "./config";

type RelationItem = { source: string; target: string; weight: number };
type RelationGroup = { relation: string; items: RelationItem[] };

function MainPage() {
  // ...你原本的主頁 code
  // 只要把 navigate("/pdf-reader") 換成 navigate("/pdf-uploader")
  // 其他不用動
  const [inputText, setInputText] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [relationGroups, setRelationGroups] = useState<RelationGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    <Box sx={{ width: "100vw", minHeight: "100vh", p: 4, boxSizing: "border-box" }}>
      {/* 頂部：跳轉 PDF OCR 的按鈕 */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/pdf-uploader")}
        >
          📄 上傳/預覽 PDF
        </Button>
      </Box>

      {/* 選取文字區塊 ... 你原本的 */}
      <Box sx={{ maxWidth: "1000px", mx: "auto", mb: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          🔍 選取文字：
        </Typography>
        <Box sx={{ bgcolor: "#f3f3f3", p: 2, borderRadius: 2 }}>
          <HighlightedText text={inputText} keywords={keywords} onClick={fetchRelations} />
        </Box>
      </Box>
      {/* ...其他內容不變 */}
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
    </Box>
  );
}

// App 根組件
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/pdf-uploader" element={<PdfUploaderPage />} />
    </Routes>
  );
}

// PDF 上傳頁
function PdfUploaderPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 2 }}>
      <Button onClick={() => navigate("/")} variant="outlined" sx={{ mb: 2 }}>
        ← 返回首頁
      </Button>
      <PdfUploader />
    </Box>
  );
}

export default App;
