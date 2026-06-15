from fastapi import APIRouter, Depends
from schemas.navigation import NavigationRouteSchema, SearchRequest, SearchResponse
from services.base import BaseVectorService
from api.deps import get_vector_service

router = APIRouter()

@router.post("/sync", response_model=dict[str, str])
async def sync_routes(
    routes: list[NavigationRouteSchema],
    vector_service: BaseVectorService = Depends(get_vector_service)
) -> dict[str, str]:
    await vector_service.upsert_routes(routes)
    return {"status": "success", "message": f"Successfully upserted {len(routes)} routes."}

@router.post("/search", response_model=SearchResponse)
async def search_navigation(
    request: SearchRequest,
    vector_service: BaseVectorService = Depends(get_vector_service)
) -> SearchResponse:
    route = await vector_service.search_route(request.query_text)
    return SearchResponse(route=route)
