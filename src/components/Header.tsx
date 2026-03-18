import { GearSix, ChartLine, Lightning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ClassificationStats } from '@/types'

interface HeaderProps {
  stats: ClassificationStats
  onOpenSettings: () => void
  onOpenAnalytics: () => void
}

export function Header({ stats, onOpenSettings, onOpenAnalytics }: HeaderProps) {
  const accuracyPercent = stats.totalArticles > 0 
    ? Math.round((stats.avgConfidence * 100))
    : 0

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent">
              <Lightning size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="font-orbitron text-2xl font-bold text-accent tracking-wider leading-none">
                NEWS CLASSIFIER
              </h1>
              <p className="text-xs text-muted-foreground font-jetbrains mt-1">
                AI-POWERED SENTIMENT ANALYSIS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-jetbrains mb-1">TOTAL</div>
              <div className="font-rajdhani text-xl font-bold text-foreground">
                {stats.totalArticles}
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-jetbrains mb-1">GOOD</div>
              <div className="font-rajdhani text-xl font-bold text-success">
                {stats.goodCount}
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-jetbrains mb-1">BAD</div>
              <div className="font-rajdhani text-xl font-bold text-destructive">
                {stats.badCount}
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-jetbrains mb-1">ACCURACY</div>
              <Badge 
                variant="outline" 
                className="font-jetbrains border-accent text-accent"
              >
                {accuracyPercent}%
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAnalytics}
              className="hover:bg-accent/10 hover:text-accent hover:border-accent transition-all"
            >
              <ChartLine size={18} weight="duotone" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="hover:bg-accent/10 hover:text-accent hover:border-accent transition-all"
            >
              <GearSix size={18} weight="duotone" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
