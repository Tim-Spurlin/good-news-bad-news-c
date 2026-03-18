import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Funnel, X, CalendarBlank, Globe } from '@phosphor-icons/react'
import type { NewsFilters } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  filters: NewsFilters
  onFiltersChange: (filters: NewsFilters) => void
  availableCountries: string[]
}

const COUNTRY_NAMES: Record<string, string> = {
  'us': 'United States',
  'gb': 'United Kingdom',
  'ca': 'Canada',
  'au': 'Australia',
  'de': 'Germany',
  'fr': 'France',
  'it': 'Italy',
  'es': 'Spain',
  'jp': 'Japan',
  'cn': 'China',
  'in': 'India',
  'br': 'Brazil',
  'mx': 'Mexico',
  'ru': 'Russia',
  'kr': 'South Korea',
  'nl': 'Netherlands',
  'se': 'Sweden',
  'no': 'Norway',
  'dk': 'Denmark',
  'fi': 'Finland'
}

export function FilterPanel({ filters, onFiltersChange, availableCountries }: FilterPanelProps) {
  const [open, setOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState<'start' | 'end' | null>(null)

  const activeFilterCount = filters.countries.length + 
    (filters.dateRange.start ? 1 : 0) + 
    (filters.dateRange.end ? 1 : 0)

  const toggleCountry = (country: string) => {
    const newCountries = filters.countries.includes(country)
      ? filters.countries.filter(c => c !== country)
      : [...filters.countries, country]
    
    onFiltersChange({
      ...filters,
      countries: newCountries
    })
  }

  const setDateRange = (type: 'start' | 'end', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date || null
      }
    })
    setDatePickerOpen(null)
  }

  const clearFilters = () => {
    onFiltersChange({
      countries: [],
      dateRange: { start: null, end: null }
    })
  }

  const removeCountry = (country: string) => {
    onFiltersChange({
      ...filters,
      countries: filters.countries.filter(c => c !== country)
    })
  }

  const clearDateRange = () => {
    onFiltersChange({
      ...filters,
      dateRange: { start: null, end: null }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "relative font-rajdhani hover:bg-accent/10 hover:text-accent hover:border-accent",
              activeFilterCount > 0 && "border-accent text-accent"
            )}
          >
            <Funnel size={16} weight="duotone" className="mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="outline" 
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground border-0 font-jetbrains text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 bg-card border-border steel-shimmer" 
          align="end"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-rajdhani font-semibold text-foreground text-sm flex items-center gap-2">
                <Funnel size={18} weight="duotone" className="text-accent" />
                Filter Articles
              </h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>

            <Separator className="bg-border" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={16} weight="duotone" className="text-accent" />
                <Label className="font-rajdhani font-medium text-sm text-foreground">
                  Source Country
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-cyber pr-2">
                {availableCountries.map(country => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country}`}
                      checked={filters.countries.includes(country)}
                      onCheckedChange={() => toggleCountry(country)}
                      className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <label
                      htmlFor={`country-${country}`}
                      className="text-sm font-jetbrains text-foreground/80 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {COUNTRY_NAMES[country] || country.toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CalendarBlank size={16} weight="duotone" className="text-accent" />
                <Label className="font-rajdhani font-medium text-sm text-foreground">
                  Date Range
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Popover open={datePickerOpen === 'start'} onOpenChange={(o) => setDatePickerOpen(o ? 'start' : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-jetbrains text-xs h-9",
                        !filters.dateRange.start && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange.start ? (
                        format(filters.dateRange.start, 'MMM dd, yy')
                      ) : (
                        'Start Date'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.start || undefined}
                      onSelect={(date) => setDateRange('start', date)}
                      disabled={(date) => 
                        date > new Date() || (filters.dateRange.end ? date > filters.dateRange.end : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={datePickerOpen === 'end'} onOpenChange={(o) => setDatePickerOpen(o ? 'end' : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-jetbrains text-xs h-9",
                        !filters.dateRange.end && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange.end ? (
                        format(filters.dateRange.end, 'MMM dd, yy')
                      ) : (
                        'End Date'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.end || undefined}
                      onSelect={(date) => setDateRange('end', date)}
                      disabled={(date) =>
                        date > new Date() || (filters.dateRange.start ? date < filters.dateRange.start : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {(filters.dateRange.start || filters.dateRange.end) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateRange}
                  className="w-full h-7 text-xs hover:bg-destructive/10 hover:text-destructive"
                >
                  <X size={14} weight="bold" className="mr-1" />
                  Clear Date Range
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {filters.countries.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.countries.map(country => (
            <Badge
              key={country}
              variant="outline"
              className="font-jetbrains text-xs border-accent text-accent hover:bg-accent/10 cursor-default"
            >
              {COUNTRY_NAMES[country] || country.toUpperCase()}
              <button
                onClick={() => removeCountry(country)}
                className="ml-1.5 hover:text-destructive transition-colors"
              >
                <X size={12} weight="bold" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {(filters.dateRange.start || filters.dateRange.end) && (
        <Badge
          variant="outline"
          className="font-jetbrains text-xs border-accent text-accent hover:bg-accent/10 cursor-default"
        >
          <CalendarBlank size={12} weight="duotone" className="mr-1" />
          {filters.dateRange.start && format(filters.dateRange.start, 'MMM dd')}
          {filters.dateRange.start && filters.dateRange.end && ' - '}
          {filters.dateRange.end && format(filters.dateRange.end, 'MMM dd, yyyy')}
          <button
            onClick={clearDateRange}
            className="ml-1.5 hover:text-destructive transition-colors"
          >
            <X size={12} weight="bold" />
          </button>
        </Badge>
      )}
    </div>
  )
}
