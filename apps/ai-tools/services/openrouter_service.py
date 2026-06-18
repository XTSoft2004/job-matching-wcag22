import json
import logging
import httpx
from typing import Optional
from core.config import settings
from schemas.query_parser import ExtractedJobQuerySchema, ExtractedSalarySchema, ExtractedOthersSchema

logger = logging.getLogger(__name__)

class OpenRouterService:
    def __init__(self) -> None:
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"

    async def parse_query(self, query_text: str) -> ExtractedJobQuerySchema:
        """
        Gửi yêu cầu đến OpenRouter để phân tích chuỗi tìm kiếm thô thành cấu trúc JSON.
        """
        if not settings.openrouter_api_key:
            logger.warning("OPENROUTER_API_KEY chưa được cấu hình. Sử dụng giá trị mặc định.")
            return self._get_fallback_schema(query_text)

        system_prompt = """
Bạn là một trợ lý tuyển dụng AI chuyên nghiệp. Nhiệm vụ của bạn là phân tích yêu cầu tìm kiếm việc làm bằng tiếng Việt và chuyển thành cấu trúc JSON.
Hãy trích xuất các thông tin sau từ nội dung yêu cầu tìm kiếm:
1. "jobs": Danh sách các chức danh công việc người dùng muốn tìm (ví dụ: ["nhân viên kinh doanh", "telesales"]). Nếu không có, để danh sách rỗng.
2. "salary": Đối tượng chứa:
   - "min": Mức lương tối thiểu mong muốn tính theo VNĐ (ví dụ: 10 triệu thì là 10000000, 15.5 triệu thì là 15500000). Nếu không nhắc tới, để null.
   - "max": Mức lương tối đa mong muốn tính theo VNĐ (ví dụ: 20 triệu thì là 20000000). Nếu không nhắc tới, để null.
   - "negotiable": Giá trị boolean (true/false) thể hiện lương có thỏa thuận/thương lượng hay không (ví dụ: "lương thỏa thuận", "thương lượng").
   - "raw_salary": Chuỗi văn bản gốc mô tả lương (ví dụ: "10tr - 20tr", "thỏa thuận").
3. "others": Đối tượng chứa:
   - "location": Địa điểm/tỉnh thành muốn làm việc (ví dụ: "Hà Nội", "Hồ Chí Minh"). Nếu không có, để null.
   - "experience": Yêu cầu kinh nghiệm mong muốn (ví dụ: "1 năm", "không yêu cầu"). Nếu không có, để null.
   - "skills": Danh sách các kỹ năng hoặc yêu cầu chuyên môn (ví dụ: ["giao tiếp", "tiếng Anh", "reactjs"]). Nếu không có, để danh sách rỗng.
   - "job_type": Loại công việc (ví dụ: "Full-time", "Part-time", "Remote", "Thực tập"). Nếu không có, để null.
   - "industry": Ngành nghề kinh doanh/lĩnh vực (ví dụ: "IT", "Marketing", "Sales"). Nếu không có, để null.
   - "raw_text": Các yêu cầu hoặc ghi chú khác trong câu.

Chỉ trả về chuỗi JSON hợp lệ, KHÔNG đi kèm bất kỳ lời giải thích, bình luận hoặc định dạng markdown (như ```json) nào cả.
""".strip()

        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/google-deepmind/antigravity",
            "X-Title": "Job Matching Web App"
        }

        data = {
            "model": settings.openrouter_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Hãy phân tích câu tìm kiếm này: \"{query_text}\""}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            logger.info(f"Đang gửi yêu cầu phân tích câu tìm kiếm đến OpenRouter với model: {settings.openrouter_model}")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url, 
                    headers=headers, 
                    json=data, 
                    timeout=25.0
                )
                
            if response.status_code != 200:
                logger.error(f"Lỗi OpenRouter API: {response.status_code} - {response.text}")
                return self._get_fallback_schema(query_text)
                
            res_json = response.json()
            if "choices" not in res_json:
                logger.error(f"Phản hồi từ OpenRouter không có 'choices'. Nội dung trả về: {res_json}")
                return self._get_fallback_schema(query_text)
            content = res_json["choices"][0]["message"]["content"].strip()
            logger.info(f"Phản hồi thô từ OpenRouter LLM: {content}")

            # Dọn dẹp markdown code blocks nếu có
            if content.startswith("```"):
                lines = content.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                content = "\n".join(lines).strip()

            parsed = json.loads(content)
            
            # Đảm bảo các thuộc tính được map đúng
            salary_data = parsed.get("salary", {})
            others_data = parsed.get("others", {})
            
            # Chuẩn hóa kiểu dữ liệu
            salary = ExtractedSalarySchema(
                min=salary_data.get("min"),
                max=salary_data.get("max"),
                negotiable=bool(salary_data.get("negotiable", False)),
                raw_salary=salary_data.get("raw_salary")
            )
            
            others = ExtractedOthersSchema(
                location=others_data.get("location"),
                experience=others_data.get("experience"),
                skills=others_data.get("skills", []),
                job_type=others_data.get("job_type"),
                industry=others_data.get("industry"),
                raw_text=others_data.get("raw_text")
            )
            
            return ExtractedJobQuerySchema(
                jobs=parsed.get("jobs", []),
                salary=salary,
                others=others
            )
            
        except Exception as e:
            logger.error(f"Xảy ra lỗi khi phân tích câu tìm kiếm với OpenRouter: {repr(e)}", exc_info=True)
            return self._get_fallback_schema(query_text)

    def _get_fallback_schema(self, query_text: str) -> ExtractedJobQuerySchema:
        """
        Tạo schema dự phòng khi gọi LLM thất bại.
        """
        logger.info("Sử dụng cấu trúc dự phòng (Fallback) cho việc tìm kiếm.")
        # Coi toàn bộ chuỗi tìm kiếm như một công việc muốn tìm kiếm
        return ExtractedJobQuerySchema(
            jobs=[query_text],
            salary=ExtractedSalarySchema(),
            others=ExtractedOthersSchema()
        )
