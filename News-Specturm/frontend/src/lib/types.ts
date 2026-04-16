export interface Article {
    id : string;
    title : string;
    source : string;
    content : string;
    url : string;
    image_url : string;
    category : number | null;
    sentiment : "positive" | "neutral" | "negative";
    pusblished_at : string
    created_at : string
    bias: "left" | "center" | "right" | null;
    bias_confidence: number | null;
    
    /*    class Article(BaseModel):
    id: Optional[str] = None
    title: str
    source: str
    summary: Optional[str] = None
    content: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    category: str = "general"
    sentiment: Optional[str] = "neutral"  # positive | neutral | negative
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
 */
}



export interface ArticlesResponse {
    articles: Article[];
    total: number;
}