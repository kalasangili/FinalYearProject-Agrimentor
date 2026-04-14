import { pipeline } from '@huggingface/transformers';

async function getLabels() {
  try {
    const classifier = await pipeline('image-classification', 'marwaALzaabi/plant-disease-detection-vit');
    console.log(JSON.stringify(classifier.model.config.id2label, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error loading model config:', err);
    process.exit(1);
  }
}

getLabels();
