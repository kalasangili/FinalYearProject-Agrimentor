def get_rotation_advice(predicted_crop: str, previous_crop: str):
    """
    Applies basic crop rotation rules.
    - If same crop → suggest alternative.
    - If same family → explain and suggest alternative.
    """
    
    # Simple mapping for crop families
    CROP_FAMILIES = {
        "rice": "Cereals", "maize": "Cereals", "wheat": "Cereals",
        "pigeonpeas": "Legumes", "mungbean": "Legumes", "blackgram": "Legumes", "lentil": "Legumes",
        "watermelon": "Melons", "muskmelon": "Melons",
        "apple": "Fruits", "mango": "Fruits", "banana": "Fruits",
        "cotton": "Fibers", "jute": "Fibers"
    }

    pred = predicted_crop.lower().strip()
    prev = previous_crop.lower().strip()

    # Case 1: Same crop
    if pred == prev:
        # Suggest a simple alternative based on family
        alternative = "Maize" if pred != "maize" else "Pigeonpeas"
        return {
            "final_crop": alternative,
            "reason": f"Avoided repeating {predicted_crop} to prevent soil nutrient depletion and pest buildup. Recommended {alternative} instead."
        }

    # Case 2: Same family
    pred_family = CROP_FAMILIES.get(pred)
    prev_family = CROP_FAMILIES.get(prev)

    if pred_family and prev_family and pred_family == prev_family:
        alternative = "Pigeonpeas" if pred_family != "Legumes" else "Rice"
        return {
            "final_crop": alternative,
            "reason": f"Both {predicted_crop} and {previous_crop} are {pred_family}. Rotating with a different family (like {alternative}) improves soil health."
        }

    # Case 3: Good rotation
    return {
        "final_crop": predicted_crop,
        "reason": f"{predicted_crop} is a great choice following {previous_crop} for a balanced crop rotation."
    }
