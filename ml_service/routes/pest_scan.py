from fastapi import APIRouter, File, UploadFile, HTTPException
import logging
from utils.preprocess import preprocess_image
from utils.predict import get_prediction

router = APIRouter(prefix="/scan-pest", tags=["AR Scanner"])
logger = logging.getLogger(__name__)

# Metadata for pests and diseases (for AR overlay)
PEST_METADATA = {
    'Aphids': {
        'severity': 'Medium',
        'treatment': 'Spray with neem oil or insecticidal soap.',
        'description': 'Small sap-sucking insects often found on the underside of leaves.'
    },
    'Spider_mites': {
        'severity': 'High',
        'treatment': 'Increase humidity and use miticides.',
        'description': 'Tiny pests that cause yellow stippling and fine webbing.'
    },
    'Whiteflies': {
        'severity': 'Medium',
        'treatment': 'Use yellow sticky traps and horticultural oil.',
        'description': 'Small white insects that fly up when the plant is disturbed.'
    },
    # Mapping existing disease labels to "AR" format
    'Tomato___Late_blight': {
        'severity': 'Critical',
        'treatment': 'Remove infected leaves and apply copper-based fungicide.',
        'description': 'Fungal-like disease causing dark, water-soaked patches.'
    },
    'Tomato___healthy': {
        'severity': 'Low',
        'treatment': 'Continue regular care and monitoring.',
        'description': 'No signs of pests or diseases detected.'
    }
}

@router.post("/")
async def scan_pest(file: UploadFile = File(...)):
    """
    Analyzes an image from the AR scanner for pests and diseases.
    """
    import main # Import inside to avoid circular dependency
    
    if main.model is None or main.class_names is None:
        raise HTTPException(status_code=503, detail="Pest detection model not loaded.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    try:
        # Read image
        contents = await file.read()
        
        # Preprocess and Predict (Reusing existing model logic)
        image_tensor = preprocess_image(contents)
        result = get_prediction(main.model, image_tensor, main.class_names)
        
        raw_label = result["predicted_class"]
        confidence = result["confidence"]
        
        # Format label for better readability (replace ___ with space)
        display_label = raw_label.replace("___", " ").replace("_", " ")
        
        # Get additional metadata
        meta = PEST_METADATA.get(raw_label, {
            'severity': 'Unknown',
            'treatment': 'Consult an agricultural expert for specific advice.',
            'description': 'No detailed information available for this detection.'
        })

        logger.info(f"AR Scan Result: {display_label} ({confidence:.2%})")

        return {
            "success": True,
            "label": display_label,
            "confidence": round(confidence, 4),
            "severity": meta['severity'],
            "treatment": meta['treatment'],
            "description": meta['description']
        }
        
    except Exception as e:
        logger.error(f"AR Scan error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing scan.")
