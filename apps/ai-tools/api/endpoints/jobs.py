from fastapi import APIRouter, HTTPException, BackgroundTasks
import logging
from pydantic import BaseModel
from schemas.job import JobPayloadSchema
from services.vector_service import PineconeVectorService
from services.openrouter_service import OpenRouterService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
vector_service = PineconeVectorService()
openrouter_service = OpenRouterService()

class JobSearchQuery(BaseModel):
    query_text: str

@router.post("/embed")
async def embed_job(payload: JobPayloadSchema, background_tasks: BackgroundTasks):
    try:
        logger.info(f"Queueing job embedding request for job_id={payload.id}, title='{payload.title}'")
        background_tasks.add_task(vector_service.embed_job, payload)
        return {"message": "Job embedding queued successfully", "job_id": payload.id}
    except Exception as e:
        logger.error(f"Error queueing job embedding: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while queueing job")

@router.post("/parse-query")
async def parse_query(query: JobSearchQuery):
    try:
        logger.info(f"Received parse request: '{query.query_text}'")
        result = await openrouter_service.parse_query(query.query_text)
        print('Result JSON', result.model_dump())
        return {"message": "Success", "data": result}
    except Exception as e:
        logger.error(f"Error parsing query: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while parsing query")

@router.post("/search")
async def search_jobs(query: JobSearchQuery):
    try:
        logger.info(f"Received job search request: '{query.query_text}'")
        
        # Phân tích câu tìm kiếm bằng LLM qua OpenRouter
        extracted_query = None
        try:
            extracted_query = await openrouter_service.parse_query(query.query_text)
            logger.info(f"Extracted Structured Query: {extracted_query.model_dump()}")
        except Exception as e:
            logger.warning(f"Failed to parse query via OpenRouter: {e}. Falling back to default search.")
            
        results = await vector_service.search_jobs(query.query_text, extracted_query=extracted_query)
        return {
            "message": "Success", 
            "data": results,
            "extracted_query": extracted_query.model_dump() if extracted_query else None
        }
    except Exception as e:
        logger.error(f"Error searching jobs: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while searching jobs")
