# World News API Integration

## Overview
The Good News / Bad News application now integrates with the World News API to fetch real news articles with images, classifications, and sentiment analysis.

## API Configuration

### API Key
- **API Key**: `65b418bf959a461e945ff22a5508fb72`
- **Base URL**: `https://api.worldnewsapi.com`
- **Account**: Tim.Spurlin@SaphyreSolutions.com

### API Features Used
1. **News Search** - `/search-news` endpoint
2. **Sentiment Analysis** - Built-in sentiment scoring from API
3. **Image Extraction** - Automatic image URLs from articles
4. **Language Filtering** - English-only articles
5. **Date Range Filtering** - Latest news retrieval

## Implementation Details

### File Structure
```
src/
├── lib/
│   ├── worldNewsApi.ts      # Main API integration
│   ├── imageExtractor.ts     # Image fallback handling
│   └── mockFeedGenerator.ts  # Fallback mock data
├── components/
│   ├── ArticleCard.tsx       # Displays images + metadata
│   └── NewsFeed.tsx          # Feed with real articles
└── App.tsx                   # Orchestrates API calls
```

### Core Functions

#### `searchNews(params: WorldNewsSearchParams)`
Fetches news articles from World News API with filtering options:
- `text` - Search query (topic name)
- `language` - Language filter (default: 'en')
- `min-sentiment` / `max-sentiment` - Sentiment range (-1 to 1)
- `number` - Number of articles to fetch
- `offset` - Pagination offset

#### `fetchNewsForTopic(topicName, topicId, count, goodPercentage)`
Intelligent news fetching that respects good/bad news ratio:
- Makes parallel requests for positive and negative sentiment
- Converts articles to internal format
- Extracts relevant images
- Calculates classification confidence

#### `convertToNewsArticle(worldNewsArticle, topicId)`
Transforms World News API article format to internal format:
- Classifies article using sentiment score or keyword analysis
- Extracts images from article or generates relevant fallback
- Parses source from URL
- Formats timestamps

### Classification Logic

#### Sentiment-Based Classification
If the API provides sentiment score:
- **Good News**: sentiment >= 0
- **Bad News**: sentiment < 0
- Confidence calculated from sentiment strength

#### Keyword-Based Classification (Fallback)
When sentiment unavailable, uses keyword matching:

**Positive Keywords**: breakthrough, success, achievement, positive, innovation, victory, win, advance, improvement, celebrate

**Negative Keywords**: crisis, conflict, failure, negative, disaster, death, attack, threat, decline, collapse

### Image Handling

#### Primary Source: World News API
Articles from the API include image URLs when available.

#### Fallback: Image Extractor
When API doesn't provide images:
1. Extracts keywords from title and body
2. Attempts to fetch from Unsplash API (if configured)
3. Generates placeholder with relevant text

#### Image Features
- Lazy loading for performance
- Error handling with graceful fallbacks
- Alt text for accessibility
- Responsive sizing

## Usage in Application

### Generating Feed with Real News
```typescript
const handleGenerateFeed = async () => {
  try {
    const articles = await fetchNewsForTopic(
      topicName,      // e.g., "Technology"
      topicId,        // Internal topic ID
      20,             // Number of articles
      50              // % good news (50% = balanced)
    )
    // Articles are automatically classified and include images
  } catch (error) {
    // Falls back to mock data on error
  }
}
```

### Topic-Based News Fetching
The application intelligently fetches news based on:
1. **Topic Name** - Used as search query
2. **Good News Percentage** - Controls sentiment filtering
3. **Article Count** - Total number of articles to fetch

Example flow:
- User creates topic "Climate Change"
- User sets 30% good news / 70% bad news
- App fetches:
  - 6 articles with positive sentiment about climate change
  - 14 articles with negative sentiment about climate change

## Error Handling

### Network Failures
- Toast notification: "Failed to fetch real news, using mock data instead"
- Automatic fallback to mock article generator
- User experience remains uninterrupted

### API Rate Limiting
- World News API has usage limits per plan
- Application handles 429 responses gracefully
- Falls back to cached or mock data

### Missing Images
- If API article lacks image, extracts relevant fallback
- Placeholder generation uses article topic/title
- All images have alt text for accessibility

## Future Enhancements

### Planned Features
1. **Caching Layer** - Store fetched articles in IndexedDB
2. **Auto-Refresh** - Periodic background updates every 15 minutes
3. **Image Optimization** - Resize and compress images for faster loading
4. **Advanced Filtering** - Source country, author, date range controls
5. **Offline Mode** - Work fully offline with cached articles

### Integration with Backend (When Available)
The current implementation is frontend-only but prepared for backend integration:

```typescript
// Future: Replace direct API calls with proxy server
const articles = await fetch('http://localhost:8000/ingest-news', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-lm-48IXAjXt:SpEuhK6SYL8sSI0YKiVb'
  },
  body: JSON.stringify({ topic: topicName, count: 20 })
})
```

### GPU-Accelerated Classification (Future)
When backend is integrated:
- Articles will be classified using `llama-nemotron-embed-1b-v2.Q6_K.gguf`
- Embeddings stored in HDF5 database
- Prototype learning from user reassignments
- IMDDS truth-filtering applied

## Testing

### Manual Testing
1. Create a new topic (e.g., "Technology")
2. Click "Generate Feed"
3. Observe real articles loading with images
4. Verify classification (Good/Bad tabs)
5. Test reassignment functionality

### Expected Behavior
- Loading toast appears during fetch
- Success toast shows article count
- Images load with lazy loading
- Articles sorted by timestamp
- Classification reflects sentiment

## Troubleshooting

### No Articles Loading
- Check network connection
- Verify API key is valid
- Check browser console for errors
- Falls back to mock data automatically

### Images Not Loading
- Some articles may not have images
- Fallback placeholders should appear
- Check CORS configuration if using custom image sources

### Wrong Classifications
- Sentiment analysis is AI-based and may be imperfect
- User can manually reassign with thumbs up/down buttons
- Future backend will learn from corrections

## API Limits & Pricing
Refer to World News API documentation for:
- Daily/monthly request limits
- Rate limiting policies
- Upgrade options for higher volume

## Security Notes
- API key is currently in frontend code (development only)
- **Production**: Move API key to environment variables
- **Backend proxy**: Route requests through your server to hide key
- Never commit API keys to public repositories
