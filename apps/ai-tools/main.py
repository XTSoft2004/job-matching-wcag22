import sys
import time
import logging

# Reconfigure stdout/stderr to support UTF-8 (emojis/Vietnamese) on Windows
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.endpoints import audio, navigation

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.project_name, 
    openapi_url=f"{settings.api_v1_str}/openapi.json",
    docs_url="/docs"
)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Đang khởi động {settings.project_name}...")
    logger.info("Tài liệu API (Swagger) đã sẵn sàng tại /docs")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} - {process_time:.2f}ms - {response.status_code}")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio.router, prefix=f"{settings.api_v1_str}/audio", tags=["audio"])
app.include_router(navigation.router, prefix=f"{settings.api_v1_str}/navigation", tags=["navigation"])
