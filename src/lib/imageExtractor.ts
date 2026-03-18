export interface ImageSearchResult {
  url: string
  alt: string
  source: 'unsplash' | 'placeholder'
}

const UNSPLASH_ACCESS_KEY = 'your-unsplash-api-key-here'

export async function extractRelevantImage(
  title: string,
  body?: string
): Promise<ImageSearchResult> {
  const searchQuery = extractKeywords(title, body)
  
  try {
    const image = await fetchFromUnsplash(searchQuery)
    if (image) return image
  } catch (error) {
    console.warn('Failed to fetch from Unsplash:', error)
  }
  
  return generatePlaceholder(searchQuery)
}

function extractKeywords(title: string, body?: string): string {
  const text = `${title} ${body || ''}`
  
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'that', 'this', 'these',
    'those', 'it', 'its', 'they', 'them', 'their'
  ])
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
  
  const wordFreq = new Map<string, number>()
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  })
  
  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word)
  
  return topWords.join(' ') || 'news'
}

async function fetchFromUnsplash(query: string): Promise<ImageSearchResult | null> {
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'your-unsplash-api-key-here') {
    return null
  }
  
  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '1')
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('content_filter', 'high')
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (data.results && data.results.length > 0) {
    const photo = data.results[0]
    return {
      url: photo.urls.regular,
      alt: photo.alt_description || photo.description || query,
      source: 'unsplash'
    }
  }
  
  return null
}

function generatePlaceholder(query: string): ImageSearchResult {
  const colors = [
    '1a1d26,353f5c',
    '282d3a,6dd4f2',
    '353f5c,6dd4f2',
    '1a1d26,4a5568',
    '282d3a,8b92a8'
  ]
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const encodedQuery = encodeURIComponent(query.slice(0, 30))
  
  return {
    url: `https://via.placeholder.com/800x450/${randomColor}/ffffff?text=${encodedQuery}`,
    alt: query,
    source: 'placeholder'
  }
}

export function getCachedImageUrl(
  articleId: string,
  imageUrl?: string
): string | undefined {
  return imageUrl
}
