import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ArticleCard } from './ArticleCard'
import { FilterPanel } from './FilterPanel'
import type { NewsArticle, ClassificationLabel, Topic, NewsFilters } from '@/types'
import { Newspaper, SmileyXEyes, Sparkle } from '@phosphor-icons/react'

interface NewsFeedProps {
  articles: NewsArticle[]
  activeFilter: ClassificationLabel
  onFilterChange: (filter: ClassificationLabel) => void
  onReclassify: (articleId: string, newLabel: ClassificationLabel) => void
  topic: Topic | null
  onGenerateFeed: () => void
}

export function NewsFeed({ articles, activeFilter, onFilterChange, onReclassify, topic, onGenerateFeed }: NewsFeedProps) {
  const [filters, setFilters] = useState<NewsFilters>({
    countries: [],
    dateRange: { start: null, end: null }
  })

  const availableCountries = useMemo(() => {
    const countries = new Set<string>()
    articles.forEach(article => {
      if (article.sourceCountry) {
        countries.add(article.sourceCountry)
      }
    })
    return Array.from(countries).sort()
  }, [articles])

  const applyFilters = useMemo(() => {
    return (articleList: NewsArticle[]) => {
      let filtered = articleList

      if (filters.countries.length > 0) {
        filtered = filtered.filter(article => 
          article.sourceCountry && filters.countries.includes(article.sourceCountry)
        )
      }

      if (filters.dateRange.start || filters.dateRange.end) {
        filtered = filtered.filter(article => {
          const articleDate = new Date(article.timestamp)
          if (filters.dateRange.start && articleDate < filters.dateRange.start) {
            return false
          }
          if (filters.dateRange.end && articleDate > filters.dateRange.end) {
            return false
          }
          return true
        })
      }

      return filtered
    }
  }, [filters])

  const filteredGoodArticles = useMemo(() => {
    const goodArticles = articles.filter(a => a.classification === 'good' && (topic?.showGoodNews ?? true))
    return applyFilters(goodArticles)
  }, [articles, topic, applyFilters])

  const filteredBadArticles = useMemo(() => {
    const badArticles = articles.filter(a => a.classification === 'bad' && (topic?.showBadNews ?? true))
    return applyFilters(badArticles)
  }, [articles, topic, applyFilters])

  const EmptyState = ({ type }: { type: ClassificationLabel }) => (
    <div className="flex flex-col items-center justify-center h-[500px] text-center">
      <div className="cyber-grid w-24 h-24 rounded-full flex items-center justify-center mb-6 border-2 border-border">
        {type === 'good' ? (
          <Newspaper size={48} weight="duotone" className="text-success" />
        ) : (
          <SmileyXEyes size={48} weight="duotone" className="text-destructive" />
        )}
      </div>
      <h3 className="font-rajdhani text-xl font-semibold text-foreground mb-2">
        No {type === 'good' ? 'Good' : 'Bad'} News Found
      </h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {type === 'good' 
          ? "No positive articles available. Generate a feed or check your topic settings."
          : "No negative articles available. Generate a feed or check your topic settings."
        }
      </p>
      <Button
        onClick={onGenerateFeed}
        className="bg-accent hover:bg-accent/90 text-accent-foreground cyber-glow"
      >
        <Sparkle size={18} weight="duotone" className="mr-2" />
        Generate Mock Feed
      </Button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Tabs value={activeFilter} onValueChange={(v) => onFilterChange(v as ClassificationLabel)} className="flex-1">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary border border-border">
            <TabsTrigger 
              value="good" 
              className="font-rajdhani font-semibold data-[state=active]:bg-success data-[state=active]:text-success-foreground data-[state=active]:cyber-glow"
            >
              Good News
              <span className="ml-2 px-2 py-0.5 rounded-full bg-success/20 text-xs font-jetbrains">
                {filteredGoodArticles.length}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="bad"
              className="font-rajdhani font-semibold data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:cyber-glow"
            >
              Bad News
              <span className="ml-2 px-2 py-0.5 rounded-full bg-destructive/20 text-xs font-jetbrains">
                {filteredBadArticles.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2 ml-4">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableCountries={availableCountries}
          />
          
          <Button
            onClick={onGenerateFeed}
            size="sm"
            variant="outline"
            className="hover:bg-accent/10 hover:text-accent hover:border-accent"
          >
            <Sparkle size={16} weight="duotone" className="mr-2" />
            Generate Feed
          </Button>
        </div>
      </div>

      <Tabs value={activeFilter} onValueChange={(v) => onFilterChange(v as ClassificationLabel)} className="flex-1">
        <TabsContent value="good" className="flex-1 mt-0">
          {filteredGoodArticles.length === 0 ? (
            <EmptyState type="good" />
          ) : (
            <ScrollArea className="h-[calc(100vh-240px)] scrollbar-cyber pr-4">
              <div className="grid gap-4 pb-4">
                {filteredGoodArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onReclassify={onReclassify}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="bad" className="flex-1 mt-0">
          {filteredBadArticles.length === 0 ? (
            <EmptyState type="bad" />
          ) : (
            <ScrollArea className="h-[calc(100vh-240px)] scrollbar-cyber pr-4">
              <div className="grid gap-4 pb-4">
                {filteredBadArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onReclassify={onReclassify}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
