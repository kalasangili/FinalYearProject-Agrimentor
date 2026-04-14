import torch
import json
import os

def load_class_names(json_path: str):
    """
    Loads class index to name mapping from a JSON file.
    """
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Class labels not found at {json_path}")
    
    with open(json_path, 'r') as f:
        return json.load(f)

def run_inference(model, image_tensor):
    """
    Runs model inference on the preprocessed image tensor.
    Returns predicted class index and confidence.
    """
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        
        confidence, predicted_idx = torch.max(probabilities, dim=0)
        
        return predicted_idx.item(), confidence.item()

def get_prediction(model, image_tensor, class_names):
    """
    Wraps inference and mapping of index to human-readable label.
    """
    idx, confidence = run_inference(model, image_tensor)
    
    # Class names JSON keys are strings
    predicted_class = class_names.get(str(idx), f"Unknown Class (Index {idx})")
    
    return {
        "predicted_class": predicted_class,
        "confidence": confidence
    }
