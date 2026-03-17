import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from '@phosphor-icons/react'
import type { AppSettings } from '@/types'
import { toast } from 'sonner'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onSave: (settings: AppSettings) => void
}

export function SettingsDialog({ open, onOpenChange, settings, onSave }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [newKeyword, setNewKeyword] = useState('')

  const handleSave = () => {
    onSave(localSettings)
    onOpenChange(false)
    toast.success('Settings saved successfully')
  }

  const addKeyword = (type: 'good' | 'bad') => {
    if (!newKeyword.trim()) return
    
    setLocalSettings(prev => ({
      ...prev,
      [`${type}Keywords`]: [...prev[`${type}Keywords` as keyof AppSettings] as string[], newKeyword.trim()]
    }))
    setNewKeyword('')
  }

  const removeKeyword = (type: 'good' | 'bad', keyword: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [`${type}Keywords`]: (prev[`${type}Keywords` as keyof AppSettings] as string[]).filter(k => k !== keyword)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-2xl text-accent">SYSTEM CONFIGURATION</DialogTitle>
          <DialogDescription className="font-jetbrains text-muted-foreground">
            Configure classification parameters and integration settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="keywords" className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="keywords" className="font-rajdhani">Keywords</TabsTrigger>
            <TabsTrigger value="api" className="font-rajdhani">API</TabsTrigger>
            <TabsTrigger value="learning" className="font-rajdhani">Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="keywords" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label className="font-rajdhani text-sm text-foreground mb-2 block">Good News Keywords</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    className="flex-1 bg-background border-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addKeyword('good')
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => addKeyword('good')}
                    className="bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <Plus size={16} weight="bold" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localSettings.goodKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="font-jetbrains border-success text-success pr-1"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword('good', keyword)}
                        className="ml-2 hover:bg-success/20 rounded p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-rajdhani text-sm text-foreground mb-2 block">Bad News Keywords</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    className="flex-1 bg-background border-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addKeyword('bad')
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => addKeyword('bad')}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    <Plus size={16} weight="bold" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localSettings.badKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="font-jetbrains border-destructive text-destructive pr-1"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword('bad', keyword)}
                        className="ml-2 hover:bg-destructive/20 rounded p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key" className="font-rajdhani text-sm text-foreground mb-2 block">
                  API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  value={localSettings.apiKey}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your API key..."
                  className="bg-background border-input font-jetbrains"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  API key for n8n workflow authentication
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refresh" className="font-rajdhani text-sm text-foreground">
                    Auto Refresh
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically fetch new articles
                  </p>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={localSettings.autoRefresh}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, autoRefresh: checked }))}
                />
              </div>

              {localSettings.autoRefresh && (
                <div>
                  <Label htmlFor="refresh-interval" className="font-rajdhani text-sm text-foreground mb-2 block">
                    Refresh Interval (minutes)
                  </Label>
                  <Input
                    id="refresh-interval"
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.refreshInterval}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) || 15 }))}
                    className="bg-background border-input font-jetbrains"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6 mt-6">
            <div className="space-y-6">
              <div>
                <Label className="font-rajdhani text-sm text-foreground mb-4 block">
                  Learning Rate: {localSettings.learningRate.toFixed(2)}
                </Label>
                <Slider
                  value={[localSettings.learningRate]}
                  onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, learningRate: value }))}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Controls how quickly the system adapts to your classifications
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="font-rajdhani font-semibold text-sm text-foreground mb-2">
                  Exponential Moving Average (EMA)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The system uses EMA to update prototype vectors based on your reassignments. 
                  Higher learning rates mean faster adaptation but less stability. 
                  Lower rates provide more stable classifications over time.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-rajdhani"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-rajdhani cyber-glow"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
