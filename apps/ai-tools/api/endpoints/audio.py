import os
import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from services.base import BaseSTTService
from api.deps import get_stt_service

router = APIRouter()

@router.post("/transcribe", response_model=dict[str, str])
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    stt_service: BaseSTTService = Depends(get_stt_service)
) -> dict[str, str]:
    if not audio_file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_bytes = await audio_file.read()

    # Save cache copy of the audio file
    cache_dir = "audio_cache"
    os.makedirs(cache_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = audio_file.filename.replace(" ", "_")
    cache_filepath = os.path.join(cache_dir, f"{timestamp}_{safe_filename}")
    
    with open(cache_filepath, "wb") as f:
        f.write(file_bytes)
    
    transcription = await stt_service.transcribe_audio(file_bytes)
    return {"transcription": transcription}
