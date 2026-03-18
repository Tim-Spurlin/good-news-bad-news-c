import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Globe, TrendUp, Calendar, Target } from '@phosphor-icons/react'
import type { NewsArticle } from '@/types'

interface AnalyticsDashboardProps {
  articles: NewsArticle[]
  onClose: () => void
}

export function AnalyticsDashboard({ articles, onClose }: AnalyticsDashboardProps) {
  const countryData = useMemo(() => {
    const countryMap = new Map<string, { good: number; bad: number; total: number }>()
    
    articles.forEach(article => {
      const country = article.sourceCountry || 'Unknown'
      const current = countryMap.get(country) || { good: 0, bad: 0, total: 0 }
      
      current.total++
      if (article.classification === 'good') {
        current.good++
      } else {
        current.bad++
      }
      
      countryMap.set(country, current)
    })
    
    return Array.from(countryMap.entries())
      .map(([name, data]) => ({
        name,
        good: data.good,
        bad: data.bad,
        total: data.total,
        goodPercentage: Math.round((data.good / data.total) * 100)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [articles])

  const timeSeriesData = useMemo(() => {
    const dayMap = new Map<string, { good: number; bad: number }>()
    
    articles.forEach(article => {
      const date = new Date(article.timestamp)
      const dayKey = date.toISOString().split('T')[0]
      const current = dayMap.get(dayKey) || { good: 0, bad: 0 }
      
      if (article.classification === 'good') {
        current.good++
      } else {
        current.bad++
      }
      
      dayMap.set(dayKey, current)
    })
    
    return Array.from(dayMap.entries())
      .map(([date, data]) => ({
        date,
        good: data.good,
        bad: data.bad,
        total: data.good + data.bad
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
  }, [articles])

  const sentimentDistribution = useMemo(() => {
    const good = articles.filter(a => a.classification === 'good').length
    const bad = articles.filter(a => a.classification === 'bad').length
    
    return [
      { name: 'Good News', value: good, color: 'oklch(0.65 0.18 150)' },
      { name: 'Bad News', value: bad, color: 'oklch(0.55 0.22 25)' }
    ]
  }, [articles])

  const topSources = useMemo(() => {
    const sourceMap = new Map<string, number>()
    
    articles.forEach(article => {
      const source = article.source || 'Unknown'
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
    })
    
    return Array.from(sourceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [articles])

  const avgConfidenceByCountry = useMemo(() => {
    const countryConfidence = new Map<string, { sum: number; count: number }>()
    
    articles.forEach(article => {
      const country = article.sourceCountry || 'Unknown'
      const current = countryConfidence.get(country) || { sum: 0, count: 0 }
      current.sum += article.confidence
      current.count++
      countryConfidence.set(country, current)
    })
    
    return Array.from(countryConfidence.entries())
      .map(([name, data]) => ({
        name,
        avgConfidence: Math.round((data.sum / data.count) * 100)
      }))
      .sort((a, b) => b.avgConfidence - a.avgConfidence)
      .slice(0, 10)
  }, [articles])

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target size={24} className="text-accent" />
            </div>
            <div>
              <h1 className="font-orbitron text-3xl font-bold text-accent">
                ANALYTICS DASHBOARD
              </h1>
              <p className="text-muted-foreground font-rajdhani">
                Visual insights across {articles.length} articles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent/20 flex items-center justify-center transition-colors"
          >
            <span className="text-2xl text-foreground">×</span>
          </button>
        </div>

        <Tabs defaultValue="geography" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="geography" className="font-rajdhani data-[state=active]:bg-primary">
              <Globe size={18} className="mr-2" />
              Geography
            </TabsTrigger>
            <TabsTrigger value="timeline" className="font-rajdhani data-[state=active]:bg-primary">
              <Calendar size={18} className="mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="font-rajdhani data-[state=active]:bg-primary">
              <TrendUp size={18} className="mr-2" />
              Sentiment
            </TabsTrigger>
            <TabsTrigger value="sources" className="font-rajdhani data-[state=active]:bg-primary">
              <Target size={18} className="mr-2" />
              Sources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geography" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border cyber-glow">
                <CardHeader>
                  <CardTitle className="font-orbitron text-accent flex items-center gap-2">
                    <Globe size={20} />
                    Articles by Country
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={countryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="oklch(0.60 0.01 240)"
                        style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                      />
                      <YAxis 
                        stroke="oklch(0.60 0.01 240)"
                        style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.18 0.01 240)',
                          border: '1px solid oklch(0.28 0.02 240)',
                          borderRadius: '0.375rem',
                          fontFamily: 'Rajdhani'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="good" fill="oklch(0.65 0.18 150)" name="Good News" />
                      <Bar dataKey="bad" fill="oklch(0.55 0.22 25)" name="Bad News" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cyber-glow">
                <CardHeader>
                  <CardTitle className="font-orbitron text-accent flex items-center gap-2">
                    <Target size={20} />
                    Classification Confidence by Country
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={avgConfidenceByCountry} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" />
                      <XAxis 
                        type="number"
                        domain={[0, 100]}
                        stroke="oklch(0.60 0.01 240)"
                        style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        stroke="oklch(0.60 0.01 240)"
                        style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.18 0.01 240)',
                          border: '1px solid oklch(0.28 0.02 240)',
                          borderRadius: '0.375rem',
                          fontFamily: 'Rajdhani'
                        }}
                      />
                      <Bar dataKey="avgConfidence" fill="oklch(0.72 0.15 195)" name="Avg Confidence %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border cyber-glow">
              <CardHeader>
                <CardTitle className="font-orbitron text-accent">
                  Country Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {countryData.map((country, idx) => (
                    <div key={country.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center font-jetbrains text-accent text-sm">
                          {idx + 1}
                        </div>
                        <span className="font-rajdhani text-lg font-medium">{country.name}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-jetbrains text-success text-sm">
                            {country.good} good
                          </div>
                          <div className="font-jetbrains text-destructive text-sm">
                            {country.bad} bad
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-orbitron text-xl text-accent">
                            {country.total}
                          </div>
                          <div className="font-jetbrains text-xs text-muted-foreground">
                            {country.goodPercentage}% good
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-card border-border cyber-glow">
              <CardHeader>
                <CardTitle className="font-orbitron text-accent flex items-center gap-2">
                  <Calendar size={20} />
                  Articles Over Time (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" />
                    <XAxis 
                      dataKey="date"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis 
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 240)',
                        border: '1px solid oklch(0.28 0.02 240)',
                        borderRadius: '0.375rem',
                        fontFamily: 'Rajdhani'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="good" 
                      stroke="oklch(0.65 0.18 150)" 
                      strokeWidth={2}
                      name="Good News"
                      dot={{ fill: 'oklch(0.65 0.18 150)', r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bad" 
                      stroke="oklch(0.55 0.22 25)" 
                      strokeWidth={2}
                      name="Bad News"
                      dot={{ fill: 'oklch(0.55 0.22 25)', r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="oklch(0.72 0.15 195)" 
                      strokeWidth={2}
                      name="Total"
                      dot={{ fill: 'oklch(0.72 0.15 195)', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border cyber-glow">
                <CardHeader>
                  <CardTitle className="font-rajdhani text-sm text-muted-foreground">
                    TOTAL ARTICLES
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-orbitron text-4xl font-bold text-accent">
                    {articles.length}
                  </div>
                  <div className="font-jetbrains text-xs text-muted-foreground mt-2">
                    Across all time periods
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cyber-glow">
                <CardHeader>
                  <CardTitle className="font-rajdhani text-sm text-muted-foreground">
                    DAILY AVERAGE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-orbitron text-4xl font-bold text-accent">
                    {timeSeriesData.length > 0 
                      ? Math.round(articles.length / timeSeriesData.length)
                      : 0
                    }
                  </div>
                  <div className="font-jetbrains text-xs text-muted-foreground mt-2">
                    Articles per day
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cyber-glow">
                <CardHeader>
                  <CardTitle className="font-rajdhani text-sm text-muted-foreground">
                    MOST ACTIVE DAY
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-orbitron text-4xl font-bold text-accent">
                    {timeSeriesData.length > 0
                      ? Math.max(...timeSeriesData.map(d => d.total))
                      : 0
                    }
                  </div>
                  <div className="font-jetbrains text-xs text-muted-foreground mt-2">
                    Peak daily articles
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border cyber-glow">
                <CardHeader>
                  <CardTitle className="font-orbitron text-accent flex items-center gap-2">
                    <TrendUp size={20} />
                    Sentiment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.18 0.01 240)',
                          border: '1px solid oklch(0.28 0.02 240)',
                          borderRadius: '0.375rem',
                          fontFamily: 'Rajdhani'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cyber-glow">
                <CardHeader>
                  <CardTitle className="font-orbitron text-accent">
                    Sentiment Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {sentimentDistribution.map(item => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-rajdhani text-lg">{item.name}</span>
                        <span className="font-orbitron text-xl text-accent">{item.value}</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${(item.value / articles.length) * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                      <div className="font-jetbrains text-xs text-muted-foreground">
                        {((item.value / articles.length) * 100).toFixed(1)}% of total articles
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border cyber-glow">
              <CardHeader>
                <CardTitle className="font-orbitron text-accent">
                  Good vs Bad News by Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={countryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" />
                    <XAxis 
                      type="number"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 240)',
                        border: '1px solid oklch(0.28 0.02 240)',
                        borderRadius: '0.375rem',
                        fontFamily: 'Rajdhani'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="good" stackId="a" fill="oklch(0.65 0.18 150)" name="Good News" />
                    <Bar dataKey="bad" stackId="a" fill="oklch(0.55 0.22 25)" name="Bad News" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card className="bg-card border-border cyber-glow">
              <CardHeader>
                <CardTitle className="font-orbitron text-accent flex items-center gap-2">
                  <Target size={20} />
                  Top News Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topSources}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" />
                    <XAxis 
                      dataKey="name"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 240)',
                        border: '1px solid oklch(0.28 0.02 240)',
                        borderRadius: '0.375rem',
                        fontFamily: 'Rajdhani'
                      }}
                    />
                    <Bar dataKey="count" fill="oklch(0.72 0.15 195)" name="Articles" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border cyber-glow">
              <CardHeader>
                <CardTitle className="font-orbitron text-accent">
                  Source Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topSources.map((source, idx) => (
                    <div key={source.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center font-jetbrains text-accent text-sm">
                          #{idx + 1}
                        </div>
                        <span className="font-rajdhani text-lg font-medium">{source.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-orbitron text-2xl text-accent">
                          {source.count}
                        </div>
                        <div className="font-jetbrains text-xs text-muted-foreground">
                          {((source.count / articles.length) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
