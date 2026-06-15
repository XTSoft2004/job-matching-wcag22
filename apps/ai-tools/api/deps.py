from typing import Generator
from services.base import BaseSTTService, BaseVectorService
from services.stt_service import FasterWhisperSTTService
from services.vector_service import PineconeVectorService

stt_service_instance = FasterWhisperSTTService()
vector_service_instance = PineconeVectorService()

def get_stt_service() -> Generator[BaseSTTService, None, None]:
    yield stt_service_instance

def get_vector_service() -> Generator[BaseVectorService, None, None]:
    yield vector_service_instance
