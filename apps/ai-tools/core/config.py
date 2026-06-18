from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_v1_str: str = "/api/v1"
    project_name: str = "Voice to Text API"
    pinecone_api_key: str = ""
    pinecone_environment: str = ""
    pinecone_index_name: str = "navigation-routes"
    whisper_model_size: str = "large-v3"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"
    embedding_model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    search_threshold: float = 0.7
    cors_origins: list[str] = ["*"]
    openrouter_api_key: str = ""
    openrouter_model: str = "google/gemini-2.5-flash"

    class Config:
        env_file = ".env"

settings = Settings()
