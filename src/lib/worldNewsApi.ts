import type { NewsArticle, ClassificationLabel } from '@/types'
import { extractRelevantImage } from './imageExtractor'

const WORLD_NEWS_API_KEY = '65b418bf959a461e945ff22a5508fb72'
const WORLD_NEWS_API_BASE_URL = 'https://api.worldnewsapi.com'

export interface WorldNewsApiArticle {
  id: number
  title: string
  text: string
  url: string
  image?: string
  publish_date: string
  author?: string
  authors?: string[]
  language: string
  source_country: string
  sentiment?: number
}

export interface WorldNewsSearchParams {
  text?: string
  'source-countries'?: string
  language?: string
  'min-sentiment'?: number
  'max-sentiment'?: number
  'earliest-publish-date'?: string
  'latest-publish-date'?: string
  number?: number
  offset?: number
}

export async function searchNews(params: WorldNewsSearchParams): Promise<WorldNewsApiArticle[]> {
  const url = new URL(`${WORLD_NEWS_API_BASE_URL}/search-news`)
  
  url.searchParams.set('api-key', WORLD_NEWS_API_KEY)
  
  if (params.text) url.searchParams.set('text', params.text)
  if (params['source-countries']) url.searchParams.set('source-countries', params['source-countries'])
  if (params.language) url.searchParams.set('language', params.language)
  if (params['min-sentiment'] !== undefined) url.searchParams.set('min-sentiment', params['min-sentiment'].toString())
  if (params['max-sentiment'] !== undefined) url.searchParams.set('max-sentiment', params['max-sentiment'].toString())
  if (params['earliest-publish-date']) url.searchParams.set('earliest-publish-date', params['earliest-publish-date'])
  if (params['latest-publish-date']) url.searchParams.set('latest-publish-date', params['latest-publish-date'])
  if (params.number) url.searchParams.set('number', params.number.toString())
  if (params.offset) url.searchParams.set('offset', params.offset.toString())

  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`World News API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.news || []
  } catch (error) {
    console.error('Failed to fetch from World News API:', error)
    throw error
  }
}

export async function classifyArticleUsingSentiment(article: WorldNewsApiArticle): Promise<ClassificationLabel> {
  if (article.sentiment !== undefined && article.sentiment !== null) {
    return article.sentiment >= 0 ? 'good' : 'bad'
  }
  
  const positiveKeywords = ['breakthrough', 'success', 'achievement', 'positive', 'innovation', 'victory', 'win', 'advance', 'improvement', 'celebrate']
  const negativeKeywords = ['crisis', 'conflict', 'failure', 'negative', 'disaster', 'death', 'attack', 'threat', 'decline', 'collapse']
  
  const text = `${article.title} ${article.text}`.toLowerCase()
  
  let positiveScore = 0
  let negativeScore = 0
  
  positiveKeywords.forEach(keyword => {
    if (text.includes(keyword)) positiveScore++
  })
  
  negativeKeywords.forEach(keyword => {
    if (text.includes(keyword)) negativeScore++
  })
  
  return positiveScore > negativeScore ? 'good' : 'bad'
}

export function calculateConfidence(article: WorldNewsApiArticle, classification: ClassificationLabel): number {
  if (article.sentiment !== undefined && article.sentiment !== null) {
    const normalizedSentiment = (article.sentiment + 1) / 2
    if (classification === 'good') {
      return normalizedSentiment * 0.4 + 0.6
    } else {
      return (1 - normalizedSentiment) * 0.4 + 0.6
    }
  }
  
  return 0.65 + Math.random() * 0.25
}

export async function convertToNewsArticle(
  worldNewsArticle: WorldNewsApiArticle,
  topicId: string
): Promise<NewsArticle> {
  const classification = await classifyArticleUsingSentiment(worldNewsArticle)
  const confidence = calculateConfidence(worldNewsArticle, classification)
  
  let imageUrl = worldNewsArticle.image
  let imageAlt = worldNewsArticle.title
  
  if (!imageUrl) {
    const imageResult = await extractRelevantImage(worldNewsArticle.title, worldNewsArticle.text)
    imageUrl = imageResult.url
    imageAlt = imageResult.alt
  }
  
  return {
    id: `world-news-${worldNewsArticle.id}-${Date.now()}`,
    title: worldNewsArticle.title,
    source: extractSourceFromUrl(worldNewsArticle.url),
    timestamp: new Date(worldNewsArticle.publish_date).getTime(),
    body: worldNewsArticle.text.substring(0, 300) + (worldNewsArticle.text.length > 300 ? '...' : ''),
    classification,
    confidence,
    topic: topicId,
    url: worldNewsArticle.url,
    imageUrl,
    imageAlt
  }
}

function extractSourceFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    const parts = hostname.split('.')
    
    if (parts.length >= 2) {
      const sourceName = parts[parts.length - 2]
      return sourceName.charAt(0).toUpperCase() + sourceName.slice(1)
    }
    
    return hostname
  } catch {
    return 'Unknown Source'
  }
}

export async function fetchNewsForTopic(
  topicName: string,
  topicId: string,
  count: number = 20,
  goodPercentage: number = 50
): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = []
  
  const goodCount = Math.round((count * goodPercentage) / 100)
  const badCount = count - goodCount
  
  try {
    const [goodNews, badNews] = await Promise.all([
      searchNews({
        text: topicName,
        language: 'en',
        'min-sentiment': 0,
        number: goodCount
      }),
      searchNews({
        text: topicName,
        language: 'en',
        'max-sentiment': 0,
        number: badCount
      })
    ])
    
    const convertedGood = await Promise.all(
      goodNews.map(article => convertToNewsArticle(article, topicId))
    )
    
    const convertedBad = await Promise.all(
      badNews.map(article => convertToNewsArticle(article, topicId))
    )
    
    articles.push(...convertedGood, ...convertedBad)
  } catch (error) {
    console.error('Failed to fetch news for topic:', error)
    throw error
  }
  
  return articles.sort((a, b) => b.timestamp - a.timestamp)
}

export async function fetchLatestNews(
  topicName: string,
  topicId: string,
  count: number = 10
): Promise<NewsArticle[]> {
  try {
    const worldNewsArticles = await searchNews({
      text: topicName,
      language: 'en',
      number: count
    })
    
    const articles = await Promise.all(
      worldNewsArticles.map(article => convertToNewsArticle(article, topicId))
    )
    
    return articles.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to fetch latest news:', error)
    throw error
  }
}
