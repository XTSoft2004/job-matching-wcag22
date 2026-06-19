import base64
import httpx
import logging
from services.base import BaseSTTService
from core.config import settings

logger = logging.getLogger(__name__)

class OpenRouterSTTService(BaseSTTService):
    def __init__(self) -> None:
        self.transcribe_url = "https://openrouter.ai/api/v1/audio/transcriptions"
        self.chat_url = "https://openrouter.ai/api/v1/chat/completions"

    async def transcribe_audio(self, file_bytes: bytes) -> str:
        if not settings.openrouter_api_key:
            logger.error("OPENROUTER_API_KEY chưa được cấu hình. Không thể chuyển giọng nói thành văn bản.")
            return ""

        # Base64 encode the audio file
        audio_b64 = base64.b64encode(file_bytes).decode("utf-8")

        # Headers for OpenRouter API
        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/google-deepmind/antigravity",
            "X-Title": "Job Matching Web App"
        }

        # Try primary method: OpenRouter transcription endpoint with Whisper Large v3
        try:
            logger.info("Đang gửi yêu cầu STT đến OpenRouter transcription API...")
            async with httpx.AsyncClient() as client:
                payload = {
                    "model": "openai/whisper-large-v3",
                    "input_audio": {
                        "data": audio_b64,
                        "format": "webm"
                    }
                }
                response = await client.post(
                    self.transcribe_url,
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )

            if response.status_code == 200:
                result = response.json()
                transcription = result.get("text", "").strip()
                logger.info(f"🎤 [Transcription API]: {transcription}")
                return transcription
            else:
                logger.warning(
                    f"Lỗi OpenRouter transcription endpoint (Status: {response.status_code}): {response.text}. "
                    "Thử sử dụng fallback với Gemini Chat Completions..."
                )
        except Exception as e:
            logger.warning(
                f"Lỗi kết nối transcription API: {repr(e)}. Thử sử dụng fallback với Gemini Chat Completions..."
            )

        # Fallback method: Gemini Multimodal Chat Completion
        try:
            # Use settings.openrouter_model if it has a value, otherwise default to google/gemini-2.5-flash
            model_name = settings.openrouter_model if settings.openrouter_model else "google/gemini-2.5-flash"
            if model_name == "openrouter/free":
                # For audio input, openrouter/free might fail if it routes to a non-multimodal model.
                # Use google/gemini-2.5-flash (or a free equivalent like google/gemini-2.0-flash-exp:free)
                model_name = "google/gemini-2.5-flash"

            logger.info(f"Đang gọi Gemini Chat Completion (Model: {model_name}) để chuyển âm thanh thành văn bản...")
            fallback_payload = {
                "model": model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Hãy chuyển âm thanh này thành văn bản tiếng Việt. Chỉ trả về nội dung văn bản được nói trong âm thanh, không thêm bất kỳ lời giải thích, bình luận hay định dạng nào."
                            },
                            {
                                "type": "input_audio",
                                "input_audio": {
                                    "data": audio_b64,
                                    "format": "webm"
                                }
                            }
                        ]
                    }
                ]
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.chat_url,
                    headers=headers,
                    json=fallback_payload,
                    timeout=30.0
                )

            if response.status_code == 200:
                result = response.json()
                transcription = result["choices"][0]["message"]["content"].strip()
                logger.info(f"🎤 [Fallback Gemini]: {transcription}")
                return transcription
            else:
                logger.error(f"Lỗi OpenRouter Chat API (Status: {response.status_code}): {response.text}")
        except Exception as ex:
            logger.error(f"Lỗi nghiêm trọng khi chạy fallback Gemini STT: {repr(ex)}")

        return ""
