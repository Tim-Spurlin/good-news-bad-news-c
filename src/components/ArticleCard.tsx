import { ThumbsUp, ThumbsDown, Clock, Newspaper as NewspaperIcon, Image as ImageIcon } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { NewsArticle } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ArticleCardProps {
  article: NewsArticle
  onReclassify: (articleId: string, newLabel: 'good' | 'bad') => void
}

export function ArticleCard({ article, onReclassify }: ArticleCardProps) {
  const isGood = article.classification === 'good'
  const confidencePercent = Math.round(article.confidence * 100)
  const [imageError, setImageError] = useState(false)

  const formattedDate = new Date(article.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <Card className="steel-shimmer group hover:animate-shimmer border-border hover:border-accent transition-all duration-300 overflow-hidden">
      {article.imageUrl && !imageError && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img 
            src={article.imageUrl} 
            alt={article.imageAlt || article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
          <div className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm rounded-md p-1.5">
            <ImageIcon size={16} weight="duotone" className="text-accent" />
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            "p-2 rounded-lg",
            isGood ? "bg-success/10" : "bg-destructive/10"
          )}>
            <NewspaperIcon 
              size={20} 
              weight="duotone" 
              className={isGood ? "text-success" : "text-destructive"} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-rajdhani font-semibold text-lg text-foreground leading-tight mb-2 line-clamp-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-jetbrains">{article.source}</span>
              <span className="flex items-center gap-1">
                <Clock size={12} weight="duotone" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {article.body && (
          <p className="text-sm text-foreground/80 line-clamp-3 mb-4 leading-relaxed">
            {article.body}
          </p>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-jetbrains text-muted-foreground">
                CONFIDENCE
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-jetbrains text-xs",
                  isGood ? "border-success text-success" : "border-destructive text-destructive"
                )}
              >
                {confidencePercent}%
              </Badge>
            </div>
            <Progress 
              value={confidencePercent} 
              className={cn(
                "h-1.5",
                isGood ? "[&>div]:bg-success" : "[&>div]:bg-destructive"
              )}
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant={isGood ? "default" : "outline"}
              onClick={() => onReclassify(article.id, 'good')}
              disabled={isGood}
              className={cn(
                "flex-1 font-rajdhani transition-all",
                isGood 
                  ? "bg-success hover:bg-success/90 text-success-foreground cyber-glow" 
                  : "hover:bg-success/10 hover:text-success hover:border-success"
              )}
            >
              <ThumbsUp size={16} weight="duotone" className="mr-2" />
              Good News
            </Button>
            <Button
              size="sm"
              variant={!isGood ? "default" : "outline"}
              onClick={() => onReclassify(article.id, 'bad')}
              disabled={!isGood}
              className={cn(
                "flex-1 font-rajdhani transition-all",
                !isGood 
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground cyber-glow" 
                  : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              )}
            >
              <ThumbsDown size={16} weight="duotone" className="mr-2" />
              Bad News
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
