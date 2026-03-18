# Image Extraction Feature

## Overview

The Good News / Bad News app now supports automatic image extraction for news articles from legal, public sources. Images are fetched based on article content to provide visual context.

## How It Works

### 1. Image Sources

The app uses **Unsplash API** as the primary legal source for images:
- **Unsplash**: Free-to-use, high-quality images with proper licensing
- **Placeholder fallback**: Styled placeholder images when Unsplash is unavailable

### 2. Image Selection Process

```
Article Created
    ↓
Extract Keywords (title + body)
    ↓
Query Unsplash API
    ↓
Select Best Match (landscape orientation, high content filter)
    ↓
Display with Lazy Loading
    ↓
Fallback to Placeholder on Error
```

### 3. Keyword Extraction

The system intelligently extracts relevant keywords:
- Removes stop words (common words like "the", "and", "or")
- Filters words by length (minimum 4 characters)
- Ranks by frequency
- Selects top 3 keywords for search

## Setup Instructions

### Option 1: Use Unsplash API (Recommended)

1. **Create a free Unsplash Developer account**:
   - Go to [https://unsplash.com/developers](https://unsplash.com/developers)
   - Create an account or sign in
   - Create a new application
   
2. **Get your Access Key**:
   - Copy your "Access Key" from the application dashboard
   
3. **Configure the app**:
   - Open `/src/lib/imageExtractor.ts`
   - Replace `'your-unsplash-api-key-here'` with your actual Access Key:
   
   ```typescript
   const UNSPLASH_ACCESS_KEY = 'your-actual-access-key-here'
   ```

4. **Rate Limits**:
   - Free tier: 50 requests per hour
   - Sufficient for demo/development use
   - For production, consider Unsplash+ or implement caching

### Option 2: Use Placeholder Images Only

If you don't want to use Unsplash:
- Leave the `UNSPLASH_ACCESS_KEY` as is
- The app will automatically fall back to placeholder images
- Placeholders are styled to match the cyber-metallic theme

## Usage

### In Mock Data Generation

```typescript
import { generateMockFeedWithImages } from '@/lib/mockFeedGenerator'

// Async version with image extraction
const articles = await generateMockFeedWithImages(topicId, 20, 50)

// Sync version without images (faster, uses placeholders)
const articles = generateMockFeed(topicId, 20, 50)
```

### In Real News Integration

When integrating with your backend (World News API + n8n):

```typescript
import { extractRelevantImage } from '@/lib/imageExtractor'

// After receiving article from API
const article = await fetchFromWorldNewsAPI()
const imageResult = await extractRelevantImage(
  article.title,
  article.body
)

// Store with article
const newsArticle: NewsArticle = {
  ...article,
  imageUrl: imageResult.url,
  imageAlt: imageResult.alt
}
```

## Image Display Features

### ArticleCard Component

- **Hero image**: 192px height, full width
- **Hover effect**: Subtle scale-up on card hover
- **Gradient overlay**: Dark gradient for text readability
- **Icon indicator**: Small image icon in top-right corner
- **Lazy loading**: Images load only when visible (performance)
- **Error handling**: Graceful fallback if image fails to load
- **Alt text**: Proper accessibility with descriptive alt attributes

### Performance Considerations

1. **Lazy Loading**: Images use `loading="lazy"` attribute
2. **Error Boundaries**: `onError` handler prevents broken images
3. **Placeholder Strategy**: Immediate fallback for failed loads
4. **Caching**: Browser automatically caches images by URL

## Legal & Ethics

### Why Unsplash?

- ✅ **Legal**: All images are free to use under Unsplash License
- ✅ **Attribution**: Not required but encouraged
- ✅ **High Quality**: Professional photography
- ✅ **Content Filter**: Can filter inappropriate content
- ✅ **API Access**: Reliable, well-documented API

### Content Safety

- Images are filtered using `content_filter: 'high'`
- Orientation locked to `landscape` for consistent display
- Search queries sanitized to prevent inappropriate results

## Troubleshooting

### Images Not Loading

1. **Check API Key**: Verify Unsplash access key is correct
2. **Check Rate Limit**: Free tier has 50 requests/hour
3. **Check Network**: Ensure API endpoints are accessible
4. **Check Console**: Look for error messages in browser console

### Placeholder Images Showing

This is normal when:
- No Unsplash API key configured
- Rate limit exceeded
- No matching images found
- Network error occurred

## Future Enhancements

- **Image Caching**: Store images in useKV for offline access
- **Multiple Sources**: Add Pexels, Pixabay as fallback sources
- **User Uploads**: Allow users to override images
- **Image Analysis**: Use AI to verify image relevance
- **Smart Caching**: Reduce API calls with intelligent caching
- **Batch Fetching**: Optimize multiple article image fetching

## API Reference

### `extractRelevantImage(title, body?)`

Extracts a relevant image based on article content.

**Parameters**:
- `title` (string): Article title (required)
- `body` (string): Article body text (optional)

**Returns**: Promise<ImageSearchResult>
```typescript
{
  url: string        // Image URL
  alt: string        // Alt text description
  source: 'unsplash' | 'placeholder'
}
```

### `generateMockFeedWithImages(topicId, count, goodPercentage)`

Generates mock articles with images (async).

**Parameters**:
- `topicId` (string): Topic identifier
- `count` (number): Number of articles to generate
- `goodPercentage` (number): Percentage of good news (0-100)

**Returns**: Promise<NewsArticle[]>

## Examples

### Basic Usage

```typescript
// Generate 10 articles with images, 70% good news
const articles = await generateMockFeedWithImages('tech', 10, 70)

articles.forEach(article => {
  console.log(`${article.title}`)
  console.log(`Image: ${article.imageUrl}`)
  console.log(`Alt: ${article.imageAlt}`)
})
```

### Custom Integration

```typescript
// Fetch image for existing article
const article = {
  title: "Scientists Discover New Planet",
  body: "Researchers have found an Earth-like exoplanet..."
}

const image = await extractRelevantImage(article.title, article.body)
// Returns: { url: "https://...", alt: "planet space", source: "unsplash" }
```

## Contact & Support

For issues or questions about image extraction:
- Check the browser console for errors
- Verify API credentials
- Review rate limits
- Ensure network connectivity

---

**Remember**: Always respect API rate limits and attribution requirements when using third-party image services.
