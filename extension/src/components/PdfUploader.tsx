import { useRef, useState } from "react";
import { Box, Button, Typography, Paper, CircularProgress, Stack, IconButton, Alert } from "@mui/material";
import { CloudUpload, NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Document, Page, pdfjs } from "react-pdf";
import { API_BASE_URL } from "../config";

pdfjs.GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";

export default function PdfUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  // 拖曳事件
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    const newFile = e.dataTransfer.files?.[0];
    if (newFile && newFile.type === "application/pdf") {
      handleFile(newFile);
    }
  };

  // 處理本地檔案
  const handleFile = (newFile: File) => {
    setFile(newFile);
    setError("");
    setPageNumber(1);
    setNumPages(0);
    setPreviewUrl(URL.createObjectURL(newFile));
  };

  // 上傳流程
  const handleUpload = async () => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch(`${API_BASE_URL}/api/upload_pdf`, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (data.pdf_url) {
        window.open(data.pdf_url, "_blank");
      } else {
        setError("上傳失敗，請再試一次！");
      }
    } catch (err) {
      setError("上傳失敗：" + (err as any).message);
    }
    setUploading(false);
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
          cursor: uploading ? "not-allowed" : "pointer",
        }}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <CloudUpload sx={{ fontSize: 40, color: "#90caf9" }} />
        <Typography sx={{ mt: 1 }}>拖曳 PDF 到這裡，或點擊選擇檔案</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          disabled={uploading}
          component="span"
        >
          選擇檔案
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          hidden
          onClick={e => { (e.target as HTMLInputElement).value = "" }}
          onChange={e => {
            const newFile = e.target.files?.[0];
            if (newFile && newFile.type === "application/pdf") handleFile(newFile);
          }}
        />
        {file && (
          <Typography sx={{ mt: 1 }} color="primary">{file.name}</Typography>
        )}
      </Paper>

      {/* PDF 預覽 */}
      {previewUrl && (
        <Box sx={{ mb: 2, border: "1px solid #eee", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
          <Document
            file={previewUrl}
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
              onClick={e => { e.stopPropagation(); setPageNumber(p => Math.max(p - 1, 1)); }}
              disabled={pageNumber <= 1}
            >
              <NavigateBefore />
            </IconButton>
            <Typography>{pageNumber} / {numPages}</Typography>
            <IconButton
              onClick={e => { e.stopPropagation(); setPageNumber(p => Math.min(p + 1, numPages)); }}
              disabled={pageNumber >= numPages}
            >
              <NavigateNext />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={uploading}
              onClick={handleUpload}
            >
              {uploading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "確認上傳"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={uploading}
              onClick={() => {
                setFile(null);
                setPreviewUrl(undefined);
                setNumPages(0);
                setPageNumber(1);
              }}
            >
              重新選擇
            </Button>
          </Stack>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
}
