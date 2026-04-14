/**
 * Crop rotation service - rule-based recommendations
 * Uses soil type, season, and crop history to suggest next crops
 */

/** Crops grouped by botanical family for rotation (avoid same family consecutively) */
const CROP_FAMILIES = {
  legume: ['peas', 'beans', 'lentils', 'soybeans', 'peanuts', 'clover', 'alfalfa'],
  brassica: ['cabbage', 'broccoli', 'cauliflower', 'kale', 'mustard', 'radish', 'turnip'],
  solanaceae: ['tomato', 'potato', 'pepper', 'eggplant'],
  cucurbit: ['cucumber', 'squash', 'pumpkin', 'melon', 'watermelon'],
  grass: ['wheat', 'corn', 'rice', 'barley', 'oats', 'sorghum', 'sugarcane'],
  aster: ['sunflower', 'lettuce'],
  mallow: ['cotton', 'okra'],
  amaranth: ['spinach', 'beet'],
  apiaceae: ['carrot'],
  allium: ['onion', 'garlic'],
};

/** Metadata for crops including benefits and precautions */
const CROP_METADATA = {
  corn: {
    benefits: 'High biomass for soil organic matter; deep roots improve soil structure.',
    precautions: 'Heavy feeder; requires significant nitrogen. Watch for corn borer.',
  },
  soybeans: {
    benefits: 'Fixes atmospheric nitrogen into soil; improves following cereal crop yields.',
    precautions: 'Susceptible to aphids and white mold. Ensure proper inoculation.',
  },
  wheat: {
    benefits: 'Prevents soil erosion; suppresses weeds. Good for breaking disease cycles.',
    precautions: 'Requires well-drained soil. Watch for fungal diseases like rust.',
  },
  rice: {
    benefits: 'Thrives in waterlogged soil where other crops fail. Improves soil hydration.',
    precautions: 'Methane emissions; heavy water requirement. Manage water levels carefully.',
  },
  peas: {
    benefits: 'Nitrogen fixation; short growing season. Improves soil fertility.',
    precautions: 'Susceptible to powdery mildew. Needs support/trellising for some varieties.',
  },
  beans: {
    benefits: 'Excellent nitrogen fixer. Improves soil structure and health.',
    precautions: 'Susceptible to various blights. Avoid over-watering.',
  },
  tomato: {
    benefits: 'High value crop; attracts beneficial insects when intercropped.',
    precautions: 'Susceptible to soil-borne diseases (blight, wilt). Needs significant support.',
  },
  potato: {
    benefits: 'Loose soil after harvest; suppresses weeds. Deep root system.',
    precautions: 'Depletes soil nutrients. Susceptible to late blight and scab.',
  },
  carrot: {
    benefits: 'Loosens soil deeply; few shared pests with grains.',
    precautions: 'Requires deep, stone-free soil. Slow germination.',
  },
  lettuce: {
    benefits: 'Quick turnover; low nutrient requirement compared to heavy feeders.',
    precautions: 'Susceptible to heat stress and bolting. Requires consistent moisture.',
  },
  cabbage: {
    benefits: 'High yield; nutrient dense. Suppresses weeds with broad leaves.',
    precautions: 'Heavy feeder; susceptible to clubroot and cabbage worms.',
  },
  cotton: {
    benefits: 'Deep taproot breaks up soil compaction. High economic value.',
    precautions: 'Susceptible to many pests (bollworm). Requires long growing season.',
  },
  sunflower: {
    benefits: 'Deep roots scavenge nutrients from lower soil layers. Attracts pollinators.',
    precautions: 'Can deplete soil moisture. Heavy feeder.',
  },
  mustard: {
    benefits: 'Bio-fumigant properties (suppresses soil-borne pests). Rapid growth.',
    precautions: 'Can become a weed if allowed to seed. Attracts aphids.',
  },
  barley: {
    benefits: 'Salt tolerant; excellent weed suppressor. Early maturing.',
    precautions: 'Susceptible to scab and rust. Needs well-drained soil.',
  },
  oats: {
    benefits: 'Great for soil structure; suppressive to root-knot nematodes.',
    precautions: 'Can be prone to lodging (falling over) in high nitrogen soils.',
  },
  onion: {
    benefits: 'Few shared pests with most field crops. Compact growth.',
    precautions: 'Requires intensive weed management. Needs consistent moisture.',
  },
  garlic: {
    benefits: 'Natural pest repellent properties. Few disease issues.',
    precautions: 'Requires long growing season. Needs fertile, well-drained soil.',
  },
  spinach: {
    benefits: 'Quick crop; good for winter or early spring. Low nutrient needs.',
    precautions: 'Prone to bolting in warm weather. Needs consistent nitrogen.',
  },
  cucumber: {
    benefits: 'Fast growing; good ground cover to suppress weeds.',
    precautions: 'Susceptible to powdery mildew and cucumber beetles.',
  },
  squash: {
    benefits: 'Broad leaves suppress weeds. Deep roots.',
    precautions: 'Large space requirement. Susceptible to vine borers.',
  },
  watermelon: {
    benefits: 'Good ground cover; high water content.',
    precautions: 'Needs sandy, well-drained soil. Long growing season.',
  },
  radish: {
    benefits: 'Very quick turnover; "tillage" radishes break up hard soil.',
    precautions: 'Susceptible to flea beetles. Must harvest quickly.',
  },
  peanuts: {
    benefits: 'Nitrogen fixer; improves soil structure. High protein yield.',
    precautions: 'Needs loose, sandy soil for "pegging". Watch for leaf spot.',
  },
  sorghum: {
    benefits: 'Drought tolerant; high biomass for organic matter.',
    precautions: 'Can inhibit growth of following crops (allelopathy). Watch for aphids.',
  },
};

/** Season suitability (simplified for common regions) */
const SEASON_CROPS = {
  summer: ['corn', 'soybeans', 'cotton', 'tomato', 'pepper', 'cucumber', 'squash', 'watermelon', 'sunflower', 'sorghum'],
  winter: ['wheat', 'barley', 'oats', 'mustard', 'peas', 'garlic', 'onion', 'spinach', 'lettuce', 'radish'],
  monsoon: ['rice', 'sorghum', 'peanuts', 'cotton', 'sugarcane', 'jute', 'beans'],
  spring: ['corn', 'soybeans', 'wheat', 'peas', 'lettuce', 'carrot', 'radish', 'cabbage'],
  fall: ['wheat', 'barley', 'mustard', 'garlic', 'spinach', 'onion'],
};

/** Soil type preferences */
const SOIL_CROPS = {
  loamy: ['corn', 'wheat', 'soybeans', 'cotton', 'tomato', 'cucumber', 'carrot', 'lettuce', 'sunflower', 'peas'],
  clay: ['rice', 'wheat', 'barley', 'cabbage', 'broccoli', 'beans', 'sorghum'],
  sandy: ['peanuts', 'carrot', 'watermelon', 'sweet potato', 'radish', 'potatoes'],
  silt: ['wheat', 'rice', 'barley', 'corn', 'lettuce', 'spinach', 'mustard'],
  'well-drained': ['tomato', 'pepper', 'corn', 'soybeans', 'cotton', 'cucumber', 'squash'],
};

function normalize(str) {
  return String(str || '').toLowerCase().trim();
}

function extractCropsFromHistory(history) {
  const text = normalize(history);
  const allCrops = Object.values(CROP_FAMILIES).flat();
  const found = [];
  for (const crop of allCrops) {
    if (text.includes(crop)) found.push(crop);
  }
  return found;
}

function getFamily(crop) {
  for (const [family, crops] of Object.entries(CROP_FAMILIES)) {
    if (crops.some((c) => crop.includes(c) || c.includes(crop))) return family;
  }
  return null;
}

/**
 * Get crop rotation recommendations based on farm details
 */
export async function getRotationAdvice(soil, season, history) {
  const soilNorm = normalize(soil);
  const seasonNorm = normalize(season);
  const historyNorm = normalize(history);

  const lastCrops = extractCropsFromHistory(historyNorm);
  const lastFamilies = [...new Set(lastCrops.map(getFamily).filter(Boolean))];

  const seasonCrops = SEASON_CROPS[seasonNorm] || Object.values(SEASON_CROPS).flat();
  let soilCrops = [];
  for (const [key, crops] of Object.entries(SOIL_CROPS)) {
    if (soilNorm.includes(key)) soilCrops = soilCrops.concat(crops);
  }
  if (soilCrops.length === 0) soilCrops = Object.values(SOIL_CROPS).flat();

  const candidates = [...new Set([...seasonCrops, ...soilCrops])];
  const recommended = [];
  const avoid = [];

  for (const c of candidates) {
    const family = getFamily(c);
    const metadata = CROP_METADATA[c] || {
      benefits: 'General soil health improvement.',
      precautions: 'Monitor for local pests and diseases.',
    };

    const isSameFamily = family && lastFamilies.includes(family);
    const isSameCrop = lastCrops.some((lc) => lc === c || c.includes(lc) || lc.includes(c));

    if (isSameFamily || isSameCrop) {
      avoid.push({
        crop: c,
        reason: isSameFamily 
          ? `Belongs to the same family (${family}) as your recent crops. Repeating families increases pest and disease pressure.`
          : `You recently grew this crop. Rotating to different crops helps break pest cycles and balance soil nutrients.`,
      });
    } else {
      recommended.push({
        crop: c,
        reason: `Suitable for ${seasonNorm || 'current'} season and ${soilNorm || 'common'} soil conditions.`,
        benefits: metadata.benefits,
        precautions: metadata.precautions,
      });
    }
  }

  const uniqueRecommended = [];
  const seen = new Set();
  for (const r of recommended) {
    if (!seen.has(r.crop)) {
      seen.add(r.crop);
      uniqueRecommended.push(r);
    }
  }

  // Prioritize legumes if history shows heavy feeders (like corn, wheat, cotton)
  const isHeavyFeederRecent = lastCrops.some((c) => ['corn', 'wheat', 'rice', 'cotton', 'sunflower'].includes(c));
  if (isHeavyFeederRecent) {
    uniqueRecommended.sort((a, b) => {
      const isALegume = getFamily(a.crop) === 'legume';
      const isBLegume = getFamily(b.crop) === 'legume';
      if (isALegume && !isBLegume) return -1;
      if (!isALegume && isBLegume) return 1;
      return 0;
    });
  }

  const topRecommendations = uniqueRecommended.slice(0, 5);
  const avoidList = avoid.slice(0, 5);

  let summary = `Based on your ${seasonNorm} season and ${soilNorm} soil, we recommend ${topRecommendations[0]?.crop || 'diversifying your crops'}. `;
  if (isHeavyFeederRecent) {
    summary += 'Since you recently grew heavy-feeding crops, we prioritized nitrogen-fixing legumes to restore soil health. ';
  }
  if (lastFamilies.length > 0) {
    summary += `Avoid ${lastFamilies.join(', ')} family crops to break pest cycles.`;
  }

  return {
    recommendations: topRecommendations,
    avoid: avoidList,
    lastCropsDetected: lastCrops.slice(0, 5),
    summary,
    updatedAt: new Date().toISOString(),
  };
}
