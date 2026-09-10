/**
 * Auto-tag suggestion service for uploaded item photos.
 * Queries Hugging Face Inference API (image classification) with an AbortController timeout.
 * Maps vision labels to the 5 core categories: Electronics, ID Cards, Bags, Books, Other.
 * Non-blocking: fails gracefully without ever interrupting the upload or form submission.
 */

const HF_MODEL = 'google/vit-base-patch16-224';
const HF_ENDPOINT = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

// Mapping dictionary from common image classification keywords to our 5 categories
const KEYWORD_MAP = {
  // Electronics
  headphone: 'Electronics',
  headset: 'Electronics',
  earphone: 'Electronics',
  phone: 'Electronics',
  cellular: 'Electronics',
  laptop: 'Electronics',
  computer: 'Electronics',
  tablet: 'Electronics',
  mouse: 'Electronics',
  keyboard: 'Electronics',
  charger: 'Electronics',
  cable: 'Electronics',
  camera: 'Electronics',
  electronic: 'Electronics',
  screen: 'Electronics',

  // ID Cards
  wallet: 'ID Cards',
  card: 'ID Cards',
  passport: 'ID Cards',
  badge: 'ID Cards',
  license: 'ID Cards',
  identity: 'ID Cards',

  // Bags
  backpack: 'Bags',
  bag: 'Bags',
  purse: 'Bags',
  knapsack: 'Bags',
  tote: 'Bags',
  pouch: 'Bags',
  suitcase: 'Bags',
  luggage: 'Bags',

  // Books
  book: 'Books',
  textbook: 'Books',
  notebook: 'Books',
  paper: 'Books',
  binder: 'Books',
  novel: 'Books',
  journal: 'Books',
  folder: 'Books',
};

/**
 * Map free-form labels to our 5 strict categories
 */
export function mapLabelToCategory(label = '') {
  const lower = label.toLowerCase();
  for (const [kw, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(kw)) {
      return category;
    }
  }
  return 'Other';
}

/**
 * Fallback heuristic based on photo filename (e.g. "backpack.jpg" -> "Bags")
 */
export function heuristicTagFromFileName(fileName = '') {
  if (!fileName) return null;
  const name = fileName.toLowerCase();
  for (const [kw, category] of Object.entries(KEYWORD_MAP)) {
    if (name.includes(kw)) {
      return { category, tag: kw };
    }
  }
  return null;
}

/**
 * Suggest category from base64 or blob via Hugging Face Inference API.
 * Times out after 4 seconds to ensure non-blocking UX.
 */
export async function suggestCategoryFromImage(imageBlobOrDataUrl, fileName = '') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    // Check filename heuristic first as rapid fallback
    const fileHint = heuristicTagFromFileName(fileName);

    let blob;
    if (typeof imageBlobOrDataUrl === 'string' && imageBlobOrDataUrl.startsWith('data:')) {
      const res = await fetch(imageBlobOrDataUrl);
      blob = await res.blob();
    } else {
      blob = imageBlobOrDataUrl;
    }

    // Call Hugging Face free tier inference API
    const response = await fetch(HF_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': blob.type || 'image/jpeg',
      },
      body: blob,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const predictions = await response.json();
      if (Array.isArray(predictions) && predictions.length > 0) {
        const topPrediction = predictions[0];
        const rawLabel = topPrediction.label || '';
        const mapped = mapLabelToCategory(rawLabel);
        return {
          success: true,
          suggestedCategory: mapped,
          rawLabel: rawLabel.split(',')[0].trim(),
          source: 'Hugging Face Vision AI',
        };
      }
    }

    // If HF responded with 503/401/rate limit or no match, check filename hint
    if (fileHint) {
      return {
        success: true,
        suggestedCategory: fileHint.category,
        rawLabel: fileHint.tag,
        source: 'File Recognition',
      };
    }

    return {
      success: false,
      reason: 'Tag suggestion unavailable',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // Check filename heuristic if API failed/aborted
    const fileHint = heuristicTagFromFileName(fileName);
    if (fileHint) {
      return {
        success: true,
        suggestedCategory: fileHint.category,
        rawLabel: fileHint.tag,
        source: 'File Recognition',
      };
    }

    return {
      success: false,
      reason: err.name === 'AbortError' ? 'Suggestion timed out' : 'Tag suggestion unavailable',
    };
  }
}
