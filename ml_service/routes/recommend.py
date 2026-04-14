from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import logging
from typing import Optional
from utils.rotation import get_rotation_advice

router = APIRouter(tags=["Recommendation"])
logger = logging.getLogger(__name__)

class RecommendationInput(BaseModel):
    nitrogen: float = Field(..., description="Nitrogen content (N)", ge=0)
    phosphorus: float = Field(..., description="Phosphorus content (P)", ge=0)
    potassium: float = Field(..., description="Potassium content (K)", ge=0)
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity in %", ge=0, le=100)
    ph: float = Field(..., description="Soil pH value", ge=0, le=14)
    rainfall: float = Field(..., description="Rainfall in mm", ge=0)
    previous_crop: str = Field(..., description="Previously grown crop")

@router.post("/recommend-crop")
async def recommend_crop(data: RecommendationInput):
    """
    Predicts the best crop based on environmental factors and rotation logic.
    """
    import main # Import inside to access global model
    
    if main.crop_model is None:
        raise HTTPException(status_code=503, detail="Crop recommendation model not loaded.")

    try:
        # 1. Preprocess: Match feature order [N, P, K, temp, humidity, ph, rain]
        features = [[
            data.nitrogen,
            data.phosphorus,
            data.potassium,
            data.temperature,
            data.humidity,
            data.ph,
            data.rainfall
        ]]

        # 2. ML Prediction
        prediction = main.crop_model.predict(features)
        raw_crop = str(prediction[0]).capitalize()

        # 3. Apply Rotation Logic
        rotation_result = get_rotation_advice(raw_crop, data.previous_crop)
        
        logger.info(f"Recommended: {rotation_result['final_crop']} (Raw prediction: {raw_crop}, Previous: {data.previous_crop})")

        return {
            "success": True,
            "recommended_crop": rotation_result["final_crop"],
            "reason": rotation_result["reason"]
        }

    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred during crop recommendation.")
