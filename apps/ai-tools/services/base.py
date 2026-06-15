from abc import ABC, abstractmethod
from schemas.navigation import NavigationRouteSchema

class BaseSTTService(ABC):
    @abstractmethod
    async def transcribe_audio(self, file_bytes: bytes) -> str:
        pass

class BaseVectorService(ABC):
    @abstractmethod
    async def upsert_routes(self, routes: list[NavigationRouteSchema]) -> None:
        pass

    @abstractmethod
    async def search_route(self, query_text: str) -> NavigationRouteSchema | None:
        pass
