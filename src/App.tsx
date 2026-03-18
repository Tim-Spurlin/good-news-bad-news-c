import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { NewsFeed } from '@/components/NewsFeed'
import { SettingsDialog } from '@/components/SettingsDialog'
import { TopicSettingsDialog } from '@/components/TopicSettingsDialog'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { generateMockFeed } from '@/lib/mockFeedGenerator'
import { fetchNewsForTopic, fetchLatestNews } from '@/lib/worldNewsApi'
import type { NewsArticle, Topic, ClassificationLabel, AppSettings, ClassificationStats } from '@/types'
import { toast } from 'sonner'

function App() {
  const [topics, setTopics] = useKV<Topic[]>('topics', [])
  const [articles, setArticles] = useKV<NewsArticle[]>('articles', [])
  const [settings, setSettings] = useKV<AppSettings>('settings', {
    goodKeywords: ['breakthrough', 'success', 'achievement', 'positive', 'innovation'],
    badKeywords: ['crisis', 'conflict', 'failure', 'negative', 'disaster'],
    apiKey: '',
    learningRate: 0.1,
    autoRefresh: false,
    refreshInterval: 15
  })

  const [activeTopicId, setActiveTopicId] = useState<string | null>(
    (topics && topics.length > 0) ? topics[0].id : null
  )
  const [activeFilter, setActiveFilter] = useState<ClassificationLabel>('good')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [topicSettingsOpen, setTopicSettingsOpen] = useState(false)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [selectedTopicForSettings, setSelectedTopicForSettings] = useState<string | null>(null)

  useEffect(() => {
    if (topics && topics.length > 0 && !activeTopicId) {
      setActiveTopicId(topics[0].id)
    }
  }, [topics, activeTopicId])

  useEffect(() => {
    setTopics((current) =>
      (current || []).map(topic => ({
        ...topic,
        articleCount: (articles || []).filter(a => a.topic === topic.id).length
      }))
    )
  }, [articles, setTopics])

  const activeTopic = useMemo(() => 
    topics?.find(t => t.id === activeTopicId) || null,
    [topics, activeTopicId]
  )

  const handleTopicAdd = (name: string) => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name,
      articleCount: 0,
      goodNewsPercentage: 50,
      showGoodNews: true,
      showBadNews: true
    }
    setTopics((current) => [...(current || []), newTopic])
    setActiveTopicId(newTopic.id)
    toast.success(`Topic "${name}" added`)
  }

  const handleTopicRemove = (topicId: string) => {
    const topic = topics?.find(t => t.id === topicId)
    setTopics((current) => (current || []).filter(t => t.id !== topicId))
    setArticles((current) => (current || []).filter(a => a.topic !== topicId))
    
    if (activeTopicId === topicId && topics && topics.length > 1) {
      const remaining = topics.filter(t => t.id !== topicId)
      setActiveTopicId(remaining[0]?.id || null)
    }
    
    if (topic) {
      toast.success(`Topic "${topic.name}" removed`)
    }
  }

  const handleTopicSettings = (topicId: string) => {
    setSelectedTopicForSettings(topicId)
    setTopicSettingsOpen(true)
  }

  const handleTopicSettingsSave = (updates: Partial<Topic>) => {
    if (!selectedTopicForSettings) return
    
    setTopics((current) =>
      (current || []).map(topic =>
        topic.id === selectedTopicForSettings
          ? { ...topic, ...updates }
          : topic
      )
    )
    toast.success('Topic settings updated')
  }

  const handleGenerateFeed = async () => {
    if (!activeTopicId || !activeTopic) {
      toast.error('No active topic selected')
      return
    }
    
    toast.loading('Fetching real news...', { id: 'fetch-news' })
    
    try {
      const newArticles = await fetchNewsForTopic(
        activeTopic.name,
        activeTopicId,
        20,
        activeTopic.goodNewsPercentage
      )
      
      if (newArticles.length > 0) {
        setArticles((current) => [...newArticles, ...(current || [])])
        toast.success(`Fetched ${newArticles.length} real articles from World News API`, { id: 'fetch-news' })
      } else {
        const mockArticles = generateMockFeed(activeTopicId, 20, activeTopic.goodNewsPercentage)
        setArticles((current) => [...mockArticles, ...(current || [])])
        toast.success(`Generated ${mockArticles.length} mock articles (no real news available)`, { id: 'fetch-news' })
      }
    } catch (error) {
      console.error('Failed to fetch news:', error)
      const mockArticles = generateMockFeed(activeTopicId, 20, activeTopic.goodNewsPercentage)
      setArticles((current) => [...mockArticles, ...(current || [])])
      toast.error('Failed to fetch real news, using mock data instead', { id: 'fetch-news' })
    }
  }

  const handleReclassify = (articleId: string, newLabel: ClassificationLabel) => {
    setArticles((current) =>
      (current || []).map(article =>
        article.id === articleId
          ? { ...article, classification: newLabel, confidence: 0.85 }
          : article
      )
    )
    toast.success(`Article reclassified as ${newLabel === 'good' ? 'Good' : 'Bad'} News`)
  }

  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings)
  }

  const filteredArticles = useMemo(() => {
    return (articles || []).filter(a => a.topic === activeTopicId)
  }, [articles, activeTopicId])

  const stats: ClassificationStats = useMemo(() => {
    const topicArticles = (articles || []).filter(a => a.topic === activeTopicId)
    const goodCount = topicArticles.filter(a => a.classification === 'good').length
    const badCount = topicArticles.filter(a => a.classification === 'bad').length
    const avgConfidence = topicArticles.length > 0
      ? topicArticles.reduce((sum, a) => sum + a.confidence, 0) / topicArticles.length
      : 0

    return {
      totalArticles: topicArticles.length,
      goodCount,
      badCount,
      avgConfidence,
      reassignmentCount: 0
    }
  }, [articles, activeTopicId])

  return (
    <div className="h-screen flex flex-col bg-background cyber-grid">
      <Header 
        stats={stats} 
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAnalytics={() => setAnalyticsOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          topics={topics || []}
          activeTopic={activeTopicId}
          onTopicSelect={setActiveTopicId}
          onTopicAdd={handleTopicAdd}
          onTopicRemove={handleTopicRemove}
          onTopicSettings={handleTopicSettings}
        />
        
        <main className="flex-1 overflow-hidden">
          {activeTopicId ? (
            <div className="h-full p-6 flex flex-col">
              <NewsFeed
                articles={filteredArticles}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onReclassify={handleReclassify}
                topic={activeTopic}
                onGenerateFeed={handleGenerateFeed}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="cyber-grid w-32 h-32 rounded-full flex items-center justify-center mb-6 border-2 border-accent mx-auto">
                  <div className="text-6xl text-accent">+</div>
                </div>
                <h2 className="font-orbitron text-2xl font-bold text-accent mb-2">
                  NO TOPICS CONFIGURED
                </h2>
                <p className="text-muted-foreground font-rajdhani">
                  Add a topic from the sidebar to begin classifying news
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings || {
          goodKeywords: [],
          badKeywords: [],
          apiKey: '',
          learningRate: 0.1,
          autoRefresh: false,
          refreshInterval: 15
        }}
        onSave={handleSettingsSave}
      />

      <TopicSettingsDialog
        open={topicSettingsOpen}
        onOpenChange={setTopicSettingsOpen}
        topic={topics?.find(t => t.id === selectedTopicForSettings) || null}
        onSave={handleTopicSettingsSave}
      />

      {analyticsOpen && (
        <AnalyticsDashboard
          articles={articles || []}
          onClose={() => setAnalyticsOpen(false)}
        />
      )}

      <Toaster 
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'bg-card border-border',
            title: 'font-rajdhani text-foreground',
            description: 'font-jetbrains text-muted-foreground',
            success: 'border-success',
            error: 'border-destructive',
          },
        }}
      />
    </div>
  )
}

export default App