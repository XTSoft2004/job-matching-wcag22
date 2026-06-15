import uuid
from typing import Optional
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from services.base import BaseVectorService
from schemas.navigation import NavigationRouteSchema
from core.config import settings

class PineconeVectorService(BaseVectorService):
    def __init__(self) -> None:
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.pc.Index(settings.pinecone_index_name)
        self._model: Optional[SentenceTransformer] = None

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer(settings.embedding_model_name)
        return self._model

    async def upsert_routes(self, routes: list[NavigationRouteSchema]) -> None:
        vectors = []
        for route in routes:
            # Chỉ sử dụng keywords để tạo vector, bỏ qua description giúp tăng độ chính xác khi so sánh
            text_to_encode = " ".join(route.keywords)
            embedding = self.model.encode(text_to_encode).tolist()
            vector_id = route.element_id
            metadata = {
                "url": route.url,
                "element_id": route.element_id,
                "keywords": route.keywords,
                "description": route.description
            }
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": metadata
            })
        
        batch_size = 100
        for i in range(0, len(vectors), batch_size):
            self.index.upsert(vectors=vectors[i:i + batch_size])

    def extract_keywords(self, text: str) -> str:
        import re
        # Xóa dấu câu, chỉ giữ lại chữ cái và khoảng trắng
        clean_text = re.sub(r'[^\w\s]', '', text.lower())
        
        # Danh sách các từ thừa (stop words) thường gặp khi ra lệnh bằng giọng nói
        stop_words = {
            "hãy", "hay", "mở", "mo", "giúp", "tôi", "cho", "xem", "vào", "đến", "đi", "nào", 
            "chuyển", "sang", "điều", "hướng", "cái", "này", "kia", "nhé", "nha", "thử"
        }
        words = clean_text.split()
        keywords = [word for word in words if word not in stop_words]
        
        # Nếu loại bỏ hết mà không còn gì, thì giữ lại nguyên văn
        if not keywords:
            return clean_text
        return " ".join(keywords)

    async def search_route(self, query_text: str) -> NavigationRouteSchema | None:
        filtered_query = self.extract_keywords(query_text)
        print(f"🧠 [Keyword Extraction]: '{query_text}' -> '{filtered_query}'")
        
        query_embedding = self.model.encode(filtered_query).tolist()
        
        response = self.index.query(
            vector=query_embedding,
            top_k=5,
            include_metadata=True
        )
        
        if not response.matches:
            print("⚠️ Không tìm thấy kết quả nào trong Pinecone.")
            return None
            
        # Re-ranking (Hybrid Search): Kết hợp Vector Score + Keyword Matching
        best_match = None
        best_score = -1
        
        for match in response.matches:
            final_score = match.score
            route_keywords = match.metadata.get("keywords", [])
            
            # Nếu câu nói chứa chính xác từ khóa của trang, cộng thêm điểm ưu tiên cực lớn
            for kw in route_keywords:
                if kw.lower() in query_text.lower():
                    final_score += 0.5
                    print(f"🔥 [Keyword Match]: Từ khóa '{kw}' khớp với câu nói! Đang boost điểm cho {match.metadata.get('element_id')}")
                    break
            
            if final_score > best_score:
                best_score = final_score
                best_match = match

        print(f"🔍 [Hybrid Search]: '{query_text}' -> Score cao nhất: {best_score} (Ngưỡng yêu cầu: {settings.search_threshold})")
        if best_score < settings.search_threshold:
            print("❌ Điểm số quá thấp, từ chối điều hướng.")
            return None
        
        print(f"✅ Đã tìm thấy trang phù hợp: {best_match.metadata.get('url', '')} (ID: {best_match.metadata.get('element_id', '')})")
            
        metadata = best_match.metadata
        return NavigationRouteSchema(
            url=metadata.get("url", ""),
            element_id=metadata.get("element_id", ""),
            keywords=metadata.get("keywords", []),
            description=metadata.get("description", "")
        )
