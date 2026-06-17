from fastapi import APIRouter, HTTPException, BackgroundTasks
import logging
from pydantic import BaseModel
from schemas.job import JobPayloadSchema
from services.vector_service import PineconeVectorService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize vector service
vector_service = PineconeVectorService()

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

@router.post("/search")
async def search_jobs(query: JobSearchQuery):
    try:
        logger.info(f"Received job search request: '{query.query_text}'")
        results = await vector_service.search_jobs(query.query_text)
        return {"message": "Success", "data": results}
    except Exception as e:
        logger.error(f"Error searching jobs: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while searching jobs")
