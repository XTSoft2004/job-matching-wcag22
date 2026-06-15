from pydantic import BaseModel

class NavigationRouteSchema(BaseModel):
    url: str
    element_id: str
    keywords: list[str]
    description: str

class SearchRequest(BaseModel):
    query_text: str

class SearchResponse(BaseModel):
    route: NavigationRouteSchema | None
