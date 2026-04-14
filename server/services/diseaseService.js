import axios from 'axios';
import FormData from 'form-data';

/**
 * Local Disease Detection Proxy Service
 * Forwards requests to the Python FastAPI microservice (ml_service)
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001/predict';

/**
 * Detailed disease database for mapping model labels to descriptions and treatments.
 * This ensures the user gets actionable advice along with the prediction.
 */
const DISEASE_METADATA = {
  'Apple___Apple_scab': {
    name: 'Apple Scab',
    treatment: 'Apply fungicides like captan or mancozeb. Prune infected branches to improve airflow.',
    cause: 'Fungal (Venturia inaequalis)',
    details: 'Olive-green to black spots on leaves and fruit; leaves may turn yellow and drop prematurely.',
  },
  'Apple___Black_rot': {
    name: 'Apple Black Rot',
    treatment: 'Remove all cankered limbs and mummified fruit. Apply copper-based fungicides.',
    cause: 'Fungal (Botryosphaeria obtusa)',
    details: 'Purple spots on leaves that enlarge and develop a tan center; fruit develops concentric rings of rot.',
  },
  'Apple___Cedar_apple_rust': {
    name: 'Cedar Apple Rust',
    treatment: 'Remove nearby cedar trees (if possible) or use rust-resistant varieties. Apply fungicides in early spring.',
    cause: 'Fungal (Gymnosporangium juniperi-virginianae)',
    details: 'Bright orange-yellow spots on the upper leaf surface; small tube-like structures appear on the underside.',
  },
  'Apple___healthy': {
    name: 'Healthy Apple',
    treatment: 'Continue regular monitoring and balanced fertilization.',
    details: 'The apple leaf is healthy and showing no signs of disease.',
    healthy: true,
  },
  'Corn___Common_rust': {
    name: 'Corn Common Rust',
    treatment: 'Plant resistant hybrids. Apply fungicides if infection occurs early in the season.',
    cause: 'Fungal (Puccinia sorghi)',
    details: 'Small, cinnamon-brown pustules on both leaf surfaces that release powdery spores.',
  },
  'Corn___Northern_Leaf_Blight': {
    name: 'Northern Corn Leaf Blight',
    treatment: 'Rotate crops and use resistant varieties. Apply fungicides if necessary.',
    cause: 'Fungal (Exserohilum turcicum)',
    details: 'Long, cigar-shaped, grayish-green to tan lesions on the leaves.',
  },
  'Corn___healthy': {
    name: 'Healthy Corn',
    treatment: 'Maintain proper irrigation and nitrogen levels.',
    details: 'The corn leaf is healthy and vibrant.',
    healthy: true,
  },
  'Grape___Black_rot': {
    name: 'Grape Black Rot',
    treatment: 'Prune and destroy infected parts. Apply fungicides like myclobutanil early in the season.',
    cause: 'Fungal (Guignardia bidwellii)',
    details: 'Small brown spots on leaves; fruit shrivels into hard, black mummies.',
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    name: 'Grape Leaf Blight',
    treatment: 'Improve air circulation. Use copper-based fungicides.',
    cause: 'Fungal (Isariopsis pyropus)',
    details: 'Irregular reddish-brown spots on leaves that may coalesce and cause leaf drop.',
  },
  'Grape___healthy': {
    name: 'Healthy Grape',
    treatment: 'Ensure proper trellis support and annual pruning.',
    details: 'The grape leaf is healthy and productive.',
    healthy: true,
  },
  'Potato___Early_blight': {
    name: 'Potato Early Blight',
    treatment: 'Use resistant varieties. Apply fungicides like chlorothalonil. Rotate crops.',
    cause: 'Fungal (Alternaria solani)',
    details: 'Small, dark spots with concentric rings (target-like appearance) on older leaves.',
  },
  'Potato___Late_blight': {
    name: 'Potato Late Blight',
    treatment: 'Use certified seed tubers. Apply protective fungicides. Remove volunteer plants.',
    cause: 'Fungal-like (Phytophthora infestans)',
    details: 'Dark, water-soaked patches on leaves that turn brown/black; white mold may appear underneath.',
  },
  'Potato___healthy': {
    name: 'Healthy Potato',
    treatment: 'Ensure good soil drainage and hilling.',
    details: 'The potato plant is healthy.',
    healthy: true,
  },
  'Tomato___Bacterial_spot': {
    name: 'Tomato Bacterial Spot',
    treatment: 'Use copper-based bactericides. Avoid overhead watering. Use disease-free seeds.',
    cause: 'Bacterial (Xanthomonas species)',
    details: 'Small, dark, water-soaked spots on leaves that may develop a yellow halo.',
  },
  'Tomato___Early_blight': {
    name: 'Tomato Early Blight',
    treatment: 'Prune lower leaves to reduce soil splash. Apply fungicides. Use mulch.',
    cause: 'Fungal (Alternaria solani)',
    details: 'Dark spots with concentric rings on lower leaves first.',
  },
  'Tomato___Late_blight': {
    name: 'Tomato Late Blight',
    treatment: 'Apply fungicides immediately. Remove and destroy infected plants. Avoid wet foliage.',
    cause: 'Fungal-like (Phytophthora infestans)',
    details: 'Large, irregular water-soaked patches on leaves and stems.',
  },
  'Tomato___Leaf_Mold': {
    name: 'Tomato Leaf Mold',
    treatment: 'Improve greenhouse ventilation. Use resistant varieties. Apply fungicides.',
    cause: 'Fungal (Passalora fulva)',
    details: 'Yellow spots on upper leaf surface; olive-green velvety mold on the underside.',
  },
  'Tomato___Septoria_leaf_spot': {
    name: 'Tomato Septoria Leaf Spot',
    treatment: 'Avoid overhead watering. Apply fungicides. Clean up garden debris in fall.',
    cause: 'Fungal (Septoria lycopersici)',
    details: 'Small, circular spots with dark borders and gray centers on lower leaves.',
  },
  'Tomato___Target_Spot': {
    name: 'Tomato Target Spot',
    treatment: 'Apply fungicides. Improve airflow. Use resistant varieties.',
    cause: 'Fungal (Corynespora cassiicola)',
    details: 'Small brown spots that enlarge into circular lesions with target-like rings.',
  },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    name: 'Tomato Yellow Leaf Curl Virus',
    treatment: 'Control whiteflies using reflective mulch or insecticides. Remove infected plants.',
    cause: 'Viral (Begomovirus)',
    details: 'Leaves curl upward and turn yellow; plants become stunted and fruit set is reduced.',
  },
  'Tomato___Tomato_mosaic_virus': {
    name: 'Tomato Mosaic Virus',
    treatment: 'Use certified seeds. Remove infected plants. Avoid handling plants after using tobacco.',
    cause: 'Viral (Tobamovirus)',
    details: 'Mottled green and yellow patterns on leaves; leaves may become narrow or "fern-like".',
  },
  'Tomato___healthy': {
    name: 'Healthy Tomato',
    treatment: 'Maintain consistent watering and provide support (cages/stakes).',
    details: 'The tomato plant is healthy.',
    healthy: true,
  },
};

/**
 * Main service entry point - Proxy to FastAPI
 */
export async function analyzeLeafImage(imageBuffer, mimeType = 'image/jpeg') {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: mimeType,
    });

    console.log(`Sending image to ML service at ${ML_SERVICE_URL}...`);
    
    const response = await axios.post(ML_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30s timeout for ML model
    });

    if (!response.data || !response.data.success) {
      throw new Error('ML service failed to return a valid prediction');
    }

    const { predicted_class, confidence } = response.data;
    const metadata = DISEASE_METADATA[predicted_class] || {
      name: predicted_class.replace(/_/g, ' '),
      treatment: 'No specific treatment data available for this label.',
      details: 'Please consult an agricultural expert for more information.',
      healthy: predicted_class.toLowerCase().includes('healthy'),
    };

    return {
      plant: predicted_class.split('___')[0] || 'Unknown Plant',
      confidence: Math.round(confidence * 100),
      healthy: !!metadata.healthy,
      disease: metadata.healthy ? null : metadata.name,
      treatment: metadata.treatment,
      cause: metadata.cause || null,
      details: metadata.details,
      suggestions: [
        {
          name: metadata.name,
          confidence: Math.round(confidence * 100),
        }
      ],
      metadata: {
        model: 'Daksh159/plant-disease-mobilenetv2',
        processedAt: new Date().toISOString(),
        rawLabel: predicted_class
      }
    };
  } catch (err) {
    console.error('Error in disease analysis proxy:', err.message);
    
    if (err.code === 'ECONNREFUSED') {
      throw new Error('ML microservice is not running. Please start the Python service on port 8000.');
    }
    
    const error = new Error(err.response?.data?.detail || err.message || 'ML inference failed');
    error.statusCode = err.response?.status || 500;
    error.code = 'ML_SERVICE_ERROR';
    throw error;
  }
}
