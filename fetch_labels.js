import { pipeline } from '@huggingface/transformers';
import fs from 'fs';

async function main() {
  try {
    const classifier = await pipeline('image-classification', 'marwaALzaabi/plant-disease-detection-vit');
    const labels = classifier.model.config.id2label;
    fs.writeFileSync('model_labels.json', JSON.stringify(labels, null, 2));
    process.exit(0);
  } catch (err) {
    fs.writeFileSync('error.log', err.stack);
    process.exit(1);
  }
}

main();
