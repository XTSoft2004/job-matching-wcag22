import uuid
from typing import Optional
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from services.base import BaseVectorService
from schemas.navigation import NavigationRouteSchema
from schemas.job import JobPayloadSchema
from schemas.query_parser import ExtractedJobQuerySchema
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
            # Thêm metadata về lương và kinh nghiệm (chỉ thêm nếu giá trị không rỗng để tránh lỗi Pinecone validation)
            if job.salaryMin is not None:
                metadata["salary_min"] = float(job.salaryMin)
            if job.salaryMax is not None:
                metadata["salary_max"] = float(job.salaryMax)
            if job.experienceLevel:
                metadata["experience_level"] = job.experienceLevel
                
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

    async def search_jobs(self, query_text: str, top_k: int = 5, extracted_query: Optional[ExtractedJobQuerySchema] = None) -> list[dict]:
        # Nếu có thông tin trích xuất cấu trúc từ LLM, sử dụng các trường đặc trưng để mã hóa câu truy vấn tinh gọn
        if extracted_query and (extracted_query.jobs or extracted_query.others.skills or extracted_query.others.location):
            jobs_part = " ".join(extracted_query.jobs)
            skills_part = " ".join(extracted_query.others.skills)
            loc_part = extracted_query.others.location or ""
            
            vector_query_parts = []
            if jobs_part:
                vector_query_parts.append(jobs_part)
            if skills_part:
                vector_query_parts.append(skills_part)
            if loc_part:
                vector_query_parts.append(loc_part)
                
            vector_query = " ".join(vector_query_parts)
            if not vector_query:
                vector_query = query_text
        else:
            vector_query = query_text

        print(f"🧠 [Semantic Search Jobs] Vector Query: '{vector_query}' (Original: '{query_text}')")
        query_embedding = self.model.encode(vector_query).tolist()
        
        response = self.index.query(
            vector=query_embedding,
            top_k=top_k * 4, # tăng top_k để có tập kết quả rộng hơn để re-score
            include_metadata=True,
            filter={"type": "job"}
        )
        
        if not response.matches:
            print("⚠️ Không tìm thấy công việc nào phù hợp.")
            return []
            
        seen_job_ids = set()
        jobs = []
        
        for match in response.matches:
            metadata = match.metadata
            job_id = metadata.get("job_id")
            
            if job_id not in seen_job_ids:
                seen_job_ids.add(job_id)
                
                title = metadata.get("title", "")
                company_name = metadata.get("company_name", "")
                text_preview = metadata.get("text", "")
                industry = metadata.get("industry", "")
                province = metadata.get("province", "")
                job_type = metadata.get("job_type", "")
                
                salary_min = metadata.get("salary_min")
                salary_max = metadata.get("salary_max")
                
                final_score = match.score
                
                # TH1: Chấm điểm dựa trên thông tin cấu trúc trích xuất từ LLM
                if extracted_query:
                    # 1. Khớp chức danh mong muốn (Title Match)
                    title_matched = False
                    for parsed_job in extracted_query.jobs:
                        if parsed_job.lower() in title.lower():
                            final_score += 0.6
                            title_matched = True
                            print(f"🔥 [Boost Title]: Tiêu đề '{title}' khớp với từ khóa '{parsed_job}' (+0.6)")
                    
                    # 2. Khớp địa điểm làm việc (Location Match)
                    if extracted_query.others.location and province:
                        loc_clean = extracted_query.others.location.lower().replace("tỉnh", "").replace("thành phố", "").replace("tp.", "").strip()
                        prov_clean = province.lower().replace("tỉnh", "").replace("thành phố", "").replace("tp.", "").strip()
                        if loc_clean in prov_clean or prov_clean in loc_clean:
                            final_score += 0.5
                            print(f"🔥 [Boost Location]: Địa điểm '{province}' khớp với yêu cầu '{extracted_query.others.location}' (+0.5)")
                    
                    # 3. Khớp loại hình công việc (Job Type Match)
                    if extracted_query.others.job_type and job_type:
                        if extracted_query.others.job_type.lower() in job_type.lower() or job_type.lower() in extracted_query.others.job_type.lower():
                            final_score += 0.3
                            print(f"🔥 [Boost Job Type]: Loại hình '{job_type}' khớp với yêu cầu '{extracted_query.others.job_type}' (+0.3)")
                    
                    # 4. Khớp mức lương (Salary Match)
                    ext_min = extracted_query.salary.min
                    ext_max = extracted_query.salary.max
                    
                    if ext_min is not None or ext_max is not None:
                        if salary_min is not None or salary_max is not None:
                            s_min = float(salary_min) if salary_min is not None else 0.0
                            s_max = float(salary_max) if salary_max is not None else float('inf')
                            
                            e_min = ext_min if ext_min is not None else 0.0
                            e_max = ext_max if ext_max is not None else float('inf')
                            
                            # Kiểm tra giao thoa giữa 2 khoảng lương
                            if max(e_min, s_min) <= min(e_max, s_max):
                                final_score += 0.4
                                print(f"🔥 [Boost Salary]: Mức lương job ({s_min/1000000}Tr - {s_max/1000000}Tr) khớp mong muốn ({e_min/1000000}Tr - {e_max/1000000}Tr) (+0.4)")
                            else:
                                final_score -= 0.3
                                print(f"⚠️ [Penalize Salary]: Lương job ({s_min/1000000}Tr - {s_max/1000000}Tr) KHÔNG khớp mong muốn ({e_min/1000000}Tr - {e_max/1000000}Tr) (-0.3)")
                        else:
                            # Job có lương thỏa thuận hoặc thương lượng
                            final_score += 0.1
                            print(f"🔥 [Salary Negotiable]: Job không ghi khoảng lương cụ thể, tương thích lương thỏa thuận (+0.1)")
                            
                    # 5. Khớp kỹ năng/skills yêu cầu
                    for skill in extracted_query.others.skills:
                        if skill.lower() in text_preview.lower() or skill.lower() in title.lower():
                            final_score += 0.2
                            print(f"🔥 [Boost Skill]: Tìm thấy kỹ năng '{skill}' (+0.2)")
                            
                # TH2: Phân tích thô dự phòng khi không có cấu trúc trích xuất
                else:
                    if query_text.lower() in title.lower():
                        final_score += 0.4
                    if company_name and query_text.lower() in company_name.lower():
                        final_score += 0.4
                    if province and query_text.lower() in province.lower():
                        final_score += 0.2
                    if industry and query_text.lower() in industry.lower():
                        final_score += 0.2

                jobs.append({
                    "score": final_score,
                    "job_id": job_id,
                    "title": title,
                    "company_id": metadata.get("company_id"),
                    "company_name": company_name,
                    "industry": industry,
                    "job_type": job_type,
                    "province": province,
                    "matched_section": metadata.get("section"),
                    "matched_text_preview": text_preview[:200]
                })
                
        # Sắp xếp theo score giảm dần
        jobs.sort(key=lambda x: x["score"], reverse=True)
        return jobs[:top_k]
