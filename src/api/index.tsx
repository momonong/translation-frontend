const API_BASE = "http://localhost:8000/api"; // 如果你用的是本地 FastAPI server

export async function fetchKeywords(text: string) {
  const res = await fetch(`${API_BASE}/keywords?text=${encodeURIComponent(text)}`);
  if (!res.ok) throw new Error("無法擷取關鍵詞");
  return res.json();
}

export async function fetchRelatedTerms(term: string, topK: number = 10) {
  const res = await fetch(`${API_BASE}/related_terms?term=${term}&top_k=${topK}`);
  if (!res.ok) throw new Error("無法取得相關詞");
  return res.json();
}
