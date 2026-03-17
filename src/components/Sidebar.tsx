import { useState } from 'react'
import { Plus, Newspaper, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { Topic } from '@/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  topics: Topic[]
  activeTopic: string | null
  onTopicSelect: (topicId: string) => void
  onTopicAdd: (name: string) => void
  onTopicRemove: (topicId: string) => void
}

export function Sidebar({ topics, activeTopic, onTopicSelect, onTopicAdd, onTopicRemove }: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')

  const handleAdd = () => {
    if (newTopicName.trim()) {
      onTopicAdd(newTopicName.trim())
      setNewTopicName('')
      setIsAdding(false)
    }
  }

  return (
    <div className="h-full w-64 metallic-gradient border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-orbitron text-lg font-bold text-accent tracking-wider flex items-center gap-2">
          <Newspaper size={24} weight="duotone" />
          TOPICS
        </h2>
      </div>

      <ScrollArea className="flex-1 scrollbar-cyber">
        <div className="p-2 space-y-1">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={cn(
                "group relative flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-200",
                activeTopic === topic.id
                  ? "bg-primary cyber-glow border border-accent"
                  : "hover:bg-secondary/50 border border-transparent hover:border-border"
              )}
              onClick={() => onTopicSelect(topic.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-rajdhani font-medium text-sm text-foreground truncate">
                  {topic.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-jetbrains">
                    {topic.articleCount}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onTopicRemove(topic.id)
                }}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        {isAdding ? (
          <div className="space-y-2">
            <Input
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Topic name..."
              className="bg-background border-input focus:border-accent focus:ring-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 cyber-glow"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setNewTopicName('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-accent transition-all"
          >
            <Plus size={16} weight="bold" className="mr-2" />
            Add Topic
          </Button>
        )}
      </div>
    </div>
  )
}
