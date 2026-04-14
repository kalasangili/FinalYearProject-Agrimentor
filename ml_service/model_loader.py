import torch
import torch.nn as nn
from torchvision import models
import os
import logging
import joblib
from huggingface_hub import hf_hub_download

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_mobilenet_v2(weights_path: str, num_classes: int = 38):
    """
    Initializes MobileNetV2 architecture, modifies classifier,
    and loads weights from the .pth file.
    """
    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Model weights not found at {weights_path}")
    
    logger.info(f"Initializing MobileNetV2 with {num_classes} classes...")
    
    # Initialize architecture WITHOUT pretrained weights
    model = models.mobilenet_v2(pretrained=False)

    # Modify classifier to match our 38 classes
    model.classifier[1] = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(model.classifier[1].in_features, num_classes)
    )

    logger.info(f"Loading weights from {weights_path} using map_location='cpu'...")
    try:
        state_dict = torch.load(weights_path, map_location=torch.device('cpu'))
        model.load_state_dict(state_dict)
        logger.info("Weights loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading state dict: {e}")
        raise

    model.eval()
    return model

def load_crop_model(repo_id: str = "Novadotgg/Crop-recommendation", filename: str = "crop.pkl"):
    """
    Downloads and loads the Random Forest crop recommendation model from Hugging Face.
    """
    logger.info(f"Downloading crop recommendation model from {repo_id}...")
    try:
        model_path = hf_hub_download(repo_id=repo_id, filename=filename)
        model = joblib.load(model_path)
        logger.info("Crop recommendation model loaded successfully!")
        return model
    except Exception as e:
        logger.error(f"Error loading crop recommendation model: {e}")
        raise
