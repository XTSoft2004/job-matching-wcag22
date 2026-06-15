import tempfile
import os
from typing import Optional
from faster_whisper import WhisperModel
from services.base import BaseSTTService
from core.config import settings

class FasterWhisperSTTService(BaseSTTService):
    def __init__(self) -> None:
        self._model: Optional[WhisperModel] = None

    @property
    def model(self) -> WhisperModel:
        if self._model is None:
            self._model = WhisperModel(
                settings.whisper_model_size,
                device=settings.whisper_device,
                compute_type=settings.whisper_compute_type
            )
        return self._model

    async def transcribe_audio(self, file_bytes: bytes) -> str:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_file:
            tmp_file.write(file_bytes)
            tmp_file_path = tmp_file.name

        try:
            segments, _ = self.model.transcribe(
                tmp_file_path, 
                language="vi",
                beam_size=5,
                vad_filter=True,
                condition_on_previous_text=False,
                initial_prompt="Đây là một ứng dụng web với các trang: trang chủ, bảng điều khiển, cài đặt và hồ sơ. Nếu người dùng yêu cầu điều hướng đến một trang, hãy chuyển họ đến trang đó"
            )
            transcription = "".join([segment.text for segment in segments])
            transcription = transcription.strip()
            print(f"🎤 [Voice -> Text]: {transcription}")
            return transcription
        finally:
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)
