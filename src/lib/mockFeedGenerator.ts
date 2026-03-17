import type { NewsArticle, ClassificationLabel } from '@/types'

const goodTitles = [
  'Scientists Discover Breakthrough Treatment for Common Disease',
  'Local Community Raises Record Amount for Charity',
  'Renewable Energy Surpasses Fossil Fuels in Major City',
  'New Technology Helps Farmers Increase Crop Yields Sustainably',
  'International Peace Agreement Signed After Decades of Conflict',
  'Medical Research Team Finds Promising Cancer Treatment',
  'Education Initiative Provides Free Learning Resources Worldwide',
  'Wildlife Population Recovery Exceeds All Expectations',
  'Clean Water Project Brings Relief to Thousands',
  'Innovation in Battery Technology Promises Longer Device Life',
  'Youth Program Reduces Crime Rate by 40% in Urban Area',
  'Historic Preservation Effort Saves Ancient Cultural Site',
  'New Study Shows Mental Health Support Programs Highly Effective',
  'Green Infrastructure Project Creates Jobs and Reduces Pollution',
  'Breakthrough in Quantum Computing Achieved by Research Team',
  'Global Vaccination Campaign Eradicates Rare Disease',
  'Innovative Recycling Program Diverts Tons from Landfills',
  'Tech Company Develops Affordable Prosthetic Limbs',
  'Educational Achievement Gaps Close in Diverse School District',
  'Coral Reef Restoration Project Shows Remarkable Success'
]

const badTitles = [
  'Economic Downturn Affects Thousands of Small Businesses',
  'Natural Disaster Leaves Community Without Power',
  'Cybersecurity Breach Exposes Sensitive Data',
  'Political Tensions Rise Over Trade Negotiations',
  'Infrastructure Collapse Causes Major Transportation Delays',
  'Company Announces Massive Layoffs Amid Restructuring',
  'Environmental Report Shows Alarming Pollution Levels',
  'Health Officials Warn of New Infectious Disease Outbreak',
  'Critical Supply Chain Disruptions Continue',
  'Housing Crisis Worsens as Prices Continue to Rise',
  'Educational System Faces Budget Cuts and Teacher Shortages',
  'Climate Change Impact More Severe Than Previously Thought',
  'Data Privacy Concerns Mount After Latest Scandal',
  'Energy Grid Struggles to Meet Rising Demand',
  'Social Unrest Grows Over Economic Inequality',
  'Wildlife Habitat Loss Accelerates at Alarming Rate',
  'Food Security Threatened by Extreme Weather Events',
  'Mental Health Crisis Overwhelms Support Services',
  'Corporate Fraud Investigation Reveals Widespread Misconduct',
  'Infrastructure Aging Faster Than Repair Efforts'
]

const sources = [
  'Global News Network',
  'Tech Today',
  'Science Daily',
  'World Report',
  'Innovation Journal',
  'Environment Watch',
  'Economic Times',
  'Health Monitor',
  'Political Review',
  'Community Voice'
]

const goodBodies = [
  'Researchers have made significant progress that could benefit millions of people worldwide. The breakthrough came after years of dedicated work and collaboration.',
  'The initiative has exceeded all expectations, bringing together diverse groups working toward a common goal. Community leaders expressed gratitude and optimism.',
  'This development represents a major milestone in addressing one of the most pressing challenges of our time. Experts are calling it a game-changer.',
  'The innovative approach has demonstrated remarkable results, showing what is possible when resources and expertise are properly aligned.',
  'Officials announced today that the program has achieved its primary objectives ahead of schedule, benefiting more people than initially projected.'
]

const badBodies = [
  'Officials are working to address the situation, but challenges remain significant. The full extent of the impact is still being assessed.',
  'Experts warn that without immediate action, the situation could deteriorate further. Concerns are growing among affected communities.',
  'The crisis has exposed vulnerabilities in existing systems and raised questions about preparedness and response capabilities.',
  'Stakeholders are calling for urgent reforms as the situation continues to affect thousands. The timeline for resolution remains uncertain.',
  'Analysis reveals that underlying issues have been ignored for too long, leading to the current state of affairs. Recovery will require sustained effort.'
]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateMockArticle(topicId: string, classification?: ClassificationLabel): NewsArticle {
  const isGood = classification === 'good' || (classification === undefined && Math.random() > 0.5)
  const titles = isGood ? goodTitles : badTitles
  const bodies = isGood ? goodBodies : badBodies
  
  return {
    id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: randomElement(titles),
    source: randomElement(sources),
    timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    body: randomElement(bodies),
    classification: isGood ? 'good' : 'bad',
    confidence: 0.65 + Math.random() * 0.3,
    topic: topicId,
    url: `https://example.com/article/${Date.now()}`
  }
}

export function generateMockFeed(
  topicId: string,
  count: number,
  goodPercentage: number = 50
): NewsArticle[] {
  const articles: NewsArticle[] = []
  const goodCount = Math.round((count * goodPercentage) / 100)
  const badCount = count - goodCount
  
  for (let i = 0; i < goodCount; i++) {
    articles.push(generateMockArticle(topicId, 'good'))
  }
  
  for (let i = 0; i < badCount; i++) {
    articles.push(generateMockArticle(topicId, 'bad'))
  }
  
  return articles.sort((a, b) => b.timestamp - a.timestamp)
}
