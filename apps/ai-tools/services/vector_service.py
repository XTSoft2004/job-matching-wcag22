import uuid
from typing import Optional
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from services.base import BaseVectorService
from schemas.navigation import NavigationRouteSchema
from schemas.job import JobPayloadSchema
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

    async def embed_job(self, job: JobPayloadSchema) -> None:
        chunks = []
        if job.description:
            chunks.append(("description", job.description))
        if job.requirements:
            chunks.append(("requirements", job.requirements))
        if job.benefits:
            chunks.append(("benefits", job.benefits))
            
        vectors = []
        company_str = f"Company: {job.companyName}\n" if job.companyName else ""
        for section, text in chunks:
            text_to_encode = f"Job Title: {job.title}\n{company_str}{section.capitalize()}: {text}"
            embedding = self.model.encode(text_to_encode).tolist()
            
            vector_id = f"job_{job.id}_{section}"
            metadata = {
                "type": "job",
                "job_id": job.id,
                "title": job.title,
                "company_id": job.companyId,
                "company_name": job.companyName or "",
                "industry": job.industry or "",
                "job_type": job.jobType,
                "province": job.province or "",
                "section": section,
                "text": text[:1000] # truncate text if too long to save space
            }
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": metadata
            })
            
        if vectors:
            self.index.upsert(vectors=vectors)

    async def search_route(self, query_text: str) -> NavigationRouteSchema | None:
        # Use full query_text for semantic meaning without removing keywords
        print(f"🧠 [Semantic Search Route]: '{query_text}'")
        
        query_embedding = self.model.encode(query_text).tolist()
        
        response = self.index.query(
            vector=query_embedding,
            top_k=5,
            include_metadata=True,
            filter={"type": {"$ne": "job"}} # avoid returning jobs when searching for routes, assuming we tag routes or jobs have type=job
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

    async def search_jobs(self, query_text: str, top_k: int = 5) -> list[dict]:
        # Perform semantic search on the full query text to capture context
        print(f"🧠 [Semantic Search Jobs]: '{query_text}'")
        query_embedding = self.model.encode(query_text).tolist()
        
        response = self.index.query(
            vector=query_embedding,
            top_k=top_k * 3, # fetch more since we might have multiple chunks per job
            include_metadata=True,
            filter={"type": "job"}
        )
        
        if not response.matches:
            print("⚠️ Không tìm thấy công việc nào phù hợp.")
            return []
            
        # Deduplicate jobs (we chunked them by section, so multiple chunks might match the same job)
        seen_job_ids = set()
        jobs = []
        
        for match in response.matches:
            metadata = match.metadata
            job_id = metadata.get("job_id")
            
            if job_id not in seen_job_ids:
                seen_job_ids.add(job_id)
                
                # Hybrid search boost
                title = metadata.get("title", "")
                company_name = metadata.get("company_name", "")
                text_preview = metadata.get("text", "")
                industry = metadata.get("industry", "")
                province = metadata.get("province", "")
                
                final_score = match.score
                
                # Boost if query matches title exactly or partially
                if query_text.lower() in title.lower():
                    final_score += 0.4
                    print(f"🔥 [Job Title Match]: Query '{query_text}' matches title '{title}'! Boosting score.")
                
                # Boost if query matches company name
                if company_name and query_text.lower() in company_name.lower():
                    final_score += 0.4
                    print(f"🔥 [Company Match]: Query '{query_text}' matches company '{company_name}'! Boosting score.")
                
                # Boost if query matches province
                if province and query_text.lower() in province.lower():
                    final_score += 0.2
                    
                # Boost if query matches industry
                if industry and query_text.lower() in industry.lower():
                    final_score += 0.2

                jobs.append({
                    "score": final_score,
                    "job_id": job_id,
                    "title": title,
                    "company_id": metadata.get("company_id"),
                    "company_name": company_name,
                    "industry": industry,
                    "job_type": metadata.get("job_type"),
                    "province": province,
                    "matched_section": metadata.get("section"),
                    "matched_text_preview": text_preview[:200]
                })
                
        # Return sorted by score
        jobs.sort(key=lambda x: x["score"], reverse=True)
        return jobs[:top_k]
