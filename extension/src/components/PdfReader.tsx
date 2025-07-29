import '../styles/AnnotationLayer.css';
import '../styles/TextLayer.css';
import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import Tesseract from "tesseract.js";
import {
  Box, Button, Typography, Alert, CircularProgress, Paper, Stack, IconButton
} from "@mui/material";
import { CloudUpload, NavigateBefore, NavigateNext } from "@mui/icons-material";

// 一定要本地 worker 路徑
pdfjs.GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";
// 設定 tesseract.js worker 路徑
(Tesseract as any).workerPath = "/assets/worker.min.js";

export default function PdfReader() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);

  // 處理 PDF 檔案上傳
  const handleFile = (f: File | null) => {
    setFile(f);
    setError("");
    setOcrText("");
    setPageNumber(1);
    setNumPages(0);
  };

  // 處理拖曳
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // OCR 主程式
  const handleOCR = async () => {
    setOcrText("");
    setLoading(true);
    setError("");
    try {
      const canvas = document.querySelector(".react-pdf__Page__canvas") as HTMLCanvasElement;
      if (!canvas) throw new Error("請先載入 PDF 頁面！");
      // 你可以改語言，例如 eng+chi_tra，但先測 eng
      const { data: { text } } = await Tesseract.recognize(canvas, "eng");
      setOcrText(text);
    } catch (e: any) {
      setError("❌ OCR 失敗：" + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        PDF OCR 工具
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: "#f8fafc",
          border: "2px dashed #90caf9",
          textAlign: "center",
          mb: 2,
          cursor: "pointer"
        }}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
      >
        <CloudUpload sx={{ fontSize: 40, color: "#90caf9" }} />
        <Typography>拖曳 PDF 到這裡，或點擊選擇檔案</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          component="label"
        >
          選擇檔案
          <input type="file" accept="application/pdf" hidden
            onChange={e => handleFile(e.target.files?.[0] || null)}
          />
        </Button>
        {file && (
          <Typography sx={{ mt: 1 }} color="primary">{file.name}</Typography>
        )}
      </Paper>

      {file && (
        <Box sx={{ mb: 2, border: "1px solid #eee", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
          <Document
            file={file}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={err => setError("PDF 載入失敗: " + err.message)}
            loading={<Box sx={{ py: 4 }}><CircularProgress /></Box>}
          >
            <Page
              pageNumber={pageNumber}
              width={640}
              renderTextLayer={true}
            />
          </Document>
          <Stack direction="row" alignItems="center" justifyContent="center" sx={{ py: 1 }}>
            <IconButton
              onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
              disabled={pageNumber <= 1}
            >
              <NavigateBefore />
            </IconButton>
            <Typography>{pageNumber} / {numPages}</Typography>
            <IconButton
              onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
              disabled={pageNumber >= numPages}
            >
              <NavigateNext />
            </IconButton>
          </Stack>
        </Box>
      )}

      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          onClick={handleOCR}
          disabled={!file || loading}
        >
          OCR本頁（Canvas識字）
        </Button>
        {loading && <CircularProgress size={28} />}
      </Stack>
      {ocrText && (
        <Paper variant="outlined" sx={{ p: 2, minHeight: 120, bgcolor: "#f3f3f3" }}>
          <Typography variant="subtitle2" color="success.main" gutterBottom>
            OCR 結果：
          </Typography>
          <Typography component="pre" sx={{ fontFamily: "inherit" }}>{ocrText}</Typography>
        </Paper>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
    </Box>
  );
}
