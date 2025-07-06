import {
    Popover,
    Typography,
    List,
    ListItem,
    Button,
    Box,
    CircularProgress,
  } from "@mui/material";
  import { useEffect, useState } from "react";
  
  const API_BASE_URL = "http://127.0.0.1:8000";
  const TARGET_LANGUAGE = "zh";
  const ALTERNATIVES_COUNT = 5;
  
  export function TranslationPopover({
    anchor,
    text,
    onClose,
    onGraphClick,
  }: {
    anchor: { top: number; left: number } | null;
    text: string;
    onClose: () => void;
    onGraphClick: (term: string) => void;
  }) {
    const [translated, setTranslated] = useState("");
    const [alts, setAlts] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (!text) {
        setTranslated("");
        setAlts([]);
        return;
      }
  
      setLoading(true);
      fetch(
        `${API_BASE_URL}/api/translate?text=${encodeURIComponent(
          text
        )}&target=${TARGET_LANGUAGE}&alternatives=${ALTERNATIVES_COUNT}`
      )
        .then((res) => res.json())
        .then((data) => {
          setTranslated(data.translated);
          setAlts(data.alternatives || []);
        })
        .catch(() => {
          setTranslated("❌ 翻譯失敗");
          setAlts([]);
        })
        .finally(() => setLoading(false));
    }, [text]);
  
    if (!anchor) return null;
  
    return (
      <Popover
        open={!!anchor}
        anchorReference="anchorPosition"
        anchorPosition={anchor}
        onClose={onClose}
        disableRestoreFocus
      >
        <Box p={2} maxWidth={300}>
          <Typography fontWeight="bold">{text}</Typography>
  
          {loading ? (
            <Box mt={1} display="flex" justifyContent="center">
              <CircularProgress size={20} />
            </Box>
          ) : (
            <>
              <Typography variant="body2" gutterBottom>
                {translated}
              </Typography>
              {alts.length > 0 && (
                <List dense>
                  {alts.map((alt, i) => (
                    <ListItem key={i}>{alt}</ListItem>
                  ))}
                </List>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  onGraphClick(text);
                  onClose();
                }}
                sx={{ mt: 1 }}
              >
                📈 顯示語意圖
              </Button>
            </>
          )}
        </Box>
      </Popover>
    );
  }
  