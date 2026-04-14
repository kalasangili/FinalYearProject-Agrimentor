from torchvision import transforms
from PIL import Image
import io

def get_preprocess_transform():
    """
    Returns the standard ImageNet preprocessing transform.
    Resize to 224x224, Convert to Tensor, and Normalize.
    """
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

def preprocess_image(image_bytes: bytes):
    """
    Preprocesses raw image bytes into a batch tensor ready for inference.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    transform = get_preprocess_transform()
    return transform(image).unsqueeze(0)  # Add batch dimension
