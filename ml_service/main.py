from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
import torch

# Modular imports
from model_loader import load_mobilenet_v2, load_crop_model
from utils.preprocess import preprocess_image
from utils.predict import get_prediction, load_class_names
from routes.recommend import router as recommend_router
from routes.pest_scan import router as pest_scan_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AgriMentor AI Backend")

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DISEASE_MODEL_PATH = os.path.join(BASE_DIR, "model", "mobilenetv2_plant.pth")
LABELS_PATH = os.path.join(BASE_DIR, "data", "class_names.json")

# Global Models (Loaded once at startup)
model = None
class_names = None
crop_model = None

@app.on_event("startup")
async def startup_event():
    global model, class_names, crop_model
    logger.info("Starting AgriMentor AI services...")
    try:
        # Load Disease Detection Model
        model = load_mobilenet_v2(DISEASE_MODEL_PATH, num_classes=38)
        class_names = load_class_names(LABELS_PATH)
        
        # Load Crop Recommendation Model
        crop_model = load_crop_model()
        
        logger.info("All models loaded successfully!")
    except Exception as e:
        logger.error(f"Startup failure: {e}")

# Include Routes
app.include_router(recommend_router)
app.include_router(pest_scan_router)

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Predicts plant disease from leaf image.
    """
    if model is None or class_names is None:
        raise HTTPException(status_code=503, detail="Disease model not ready.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        contents = await file.read()
        image_tensor = preprocess_image(contents)
        result = get_prediction(model, image_tensor, class_names)
        
        return {
            "success": True,
            "predicted_class": result["predicted_class"],
            "confidence": round(result["confidence"], 4)
        }
    except Exception as e:
        logger.error(f"Disease prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed.")

@app.get("/health")
async def health():
    return {
        "status": "healthy" if (model and crop_model) else "degraded",
        "disease_model": model is not None,
        "crop_model": crop_model is not None
    }

if __name__ == "__main__":
    import uvicorn
    # Use 8001 if 8000 is still busy or restricted
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
