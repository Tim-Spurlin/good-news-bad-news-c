import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Sliders, ThumbsUp, ThumbsDown } from '@phosphor-icons/react'
import type { Topic } from '@/types'

interface TopicSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic: Topic | null
  onSave: (updates: Partial<Topic>) => void
}

export function TopicSettingsDialog({ open, onOpenChange, topic, onSave }: TopicSettingsDialogProps) {
  if (!topic) return null

  const handlePercentageChange = (value: number[]) => {
    onSave({ goodNewsPercentage: value[0] })
  }

  const handleShowGoodChange = (checked: boolean) => {
    onSave({ showGoodNews: checked })
  }

  const handleShowBadChange = (checked: boolean) => {
    onSave({ showBadNews: checked })
  }

  const badPercentage = 100 - topic.goodNewsPercentage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-2xl text-accent flex items-center gap-2">
            <Sliders size={24} weight="duotone" />
            TOPIC FEED SETTINGS
          </DialogTitle>
          <DialogDescription className="font-jetbrains text-muted-foreground">
            Configure feed content distribution for "{topic.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-rajdhani text-sm text-foreground">Content Distribution</Label>
              <div className="flex items-center gap-4 font-jetbrains text-xs">
                <div className="flex items-center gap-2">
                  <ThumbsUp size={14} weight="duotone" className="text-success" />
                  <span className="text-success font-bold">{topic.goodNewsPercentage}%</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <ThumbsDown size={14} weight="duotone" className="text-destructive" />
                  <span className="text-destructive font-bold">{badPercentage}%</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Slider
                value={[topic.goodNewsPercentage]}
                onValueChange={handlePercentageChange}
                min={0}
                max={100}
                step={5}
                className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground font-jetbrains">
                <span>0% Good</span>
                <span>50/50</span>
                <span>100% Good</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Sliders size={18} weight="duotone" className="text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-rajdhani font-semibold text-sm text-foreground mb-1">
                    Feed Balance Control
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Adjust the slider to control what percentage of good news vs bad news appears in this topic's feed. 
                    The system will generate mock articles matching your preferred distribution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="font-rajdhani text-sm text-foreground block mb-3">
              Content Visibility
            </Label>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <ThumbsUp size={20} weight="duotone" className="text-success" />
                </div>
                <div>
                  <div className="font-rajdhani font-medium text-sm text-foreground">
                    Show Good News
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Display positive articles in feed
                  </div>
                </div>
              </div>
              <Switch
                checked={topic.showGoodNews}
                onCheckedChange={handleShowGoodChange}
                className="data-[state=checked]:bg-success"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <ThumbsDown size={20} weight="duotone" className="text-destructive" />
                </div>
                <div>
                  <div className="font-rajdhani font-medium text-sm text-foreground">
                    Show Bad News
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Display negative articles in feed
                  </div>
                </div>
              </div>
              <Switch
                checked={topic.showBadNews}
                onCheckedChange={handleShowBadChange}
                className="data-[state=checked]:bg-destructive"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-rajdhani"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
