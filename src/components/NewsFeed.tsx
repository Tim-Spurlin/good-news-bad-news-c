import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArticleCard } from './ArticleCard'
import type { NewsArticle, ClassificationLabel } from '@/types'
import { Newspaper, SmileyXEyes } from '@phosphor-icons/react'

interface NewsFeedProps {
  articles: NewsArticle[]
  activeFilter: ClassificationLabel
  onFilterChange: (filter: ClassificationLabel) => void
  onReclassify: (articleId: string, newLabel: ClassificationLabel) => void
}

export function NewsFeed({ articles, activeFilter, onFilterChange, onReclassify }: NewsFeedProps) {
  const goodArticles = articles.filter(a => a.classification === 'good')
  const badArticles = articles.filter(a => a.classification === 'bad')

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
      <p className="text-muted-foreground text-sm max-w-md">
        {type === 'good' 
          ? "No positive articles have been classified yet. Wait for new articles or reclassify existing ones."
          : "No negative articles have been classified yet. Wait for new articles or reclassify existing ones."
        }
      </p>
    </div>
  )

  return (
    <Tabs value={activeFilter} onValueChange={(v) => onFilterChange(v as ClassificationLabel)} className="flex-1">
      <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary border border-border">
        <TabsTrigger 
          value="good" 
          className="font-rajdhani font-semibold data-[state=active]:bg-success data-[state=active]:text-success-foreground data-[state=active]:cyber-glow"
        >
          Good News
          <span className="ml-2 px-2 py-0.5 rounded-full bg-success/20 text-xs font-jetbrains">
            {goodArticles.length}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="bad"
          className="font-rajdhani font-semibold data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:cyber-glow"
        >
          Bad News
          <span className="ml-2 px-2 py-0.5 rounded-full bg-destructive/20 text-xs font-jetbrains">
            {badArticles.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="good" className="flex-1 mt-6">
        {goodArticles.length === 0 ? (
          <EmptyState type="good" />
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)] scrollbar-cyber pr-4">
            <div className="grid gap-4 pb-4">
              {goodArticles.map((article) => (
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

      <TabsContent value="bad" className="flex-1 mt-6">
        {badArticles.length === 0 ? (
          <EmptyState type="bad" />
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)] scrollbar-cyber pr-4">
            <div className="grid gap-4 pb-4">
              {badArticles.map((article) => (
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
  )
}
