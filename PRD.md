# Planning Guide

A sophisticated news classification interface that separates "Good News" from "Bad News" using AI-powered sentiment analysis, featuring a professional cyber-metallic aesthetic ready for backend integration with GPU-accelerated embeddings and RAG stack.

**Experience Qualities**: 
1. **Futuristic Precision** - Every interaction feels like operating advanced cyber-intelligence software with crisp, responsive controls
2. **Information Density** - Maximum data visibility without clutter, using cards, tabs, and virtualized scrolling
3. **Technical Authority** - Professional metallic design that conveys serious analytical capability and trustworthiness

**Complexity Level**: Light Application (multiple features with basic state) - A news reader with classification controls, topic management, and settings, designed as a functional prototype ready for backend integration with the full RAG pipeline.

## Essential Features

**Topic Management Sidebar**
- Functionality: Add, remove, and switch between news topic categories
- Purpose: Organize news feeds by user-defined interests
- Trigger: Click "+" button in sidebar or topic labels
- Progression: Click add → Enter topic name → Topic appears in sidebar → Click topic to view feed
- Success criteria: Topics persist between sessions, active topic is visually highlighted

**Dual-Feed Classification View**
- Functionality: Display news articles in separate "Good News" and "Bad News" tabs with infinite scroll
- Purpose: Present AI-classified content in organized, scannable feeds
- Trigger: Select topic from sidebar, switch between Good/Bad tabs
- Progression: Select topic → View default Good tab → See classified articles → Switch to Bad tab → Scroll infinitely through content
- Success criteria: Smooth tab transitions, cards load seamlessly, clear visual distinction between feeds

**Article Card Interaction**
- Functionality: Display article metadata (title, source, date, classification score) with reassignment controls
- Purpose: Allow users to review and correct AI classifications, improving prototype learning
- Trigger: View article card, click reassignment button
- Progression: Read article summary → Click "Mark as Good" or "Mark as Bad" → Instant visual feedback → Card updates classification
- Success criteria: One-click reassignment, immediate UI update, toast confirmation

**Settings & Configuration Panel**
- Functionality: Configure custom good/bad keywords, API credentials, learning rate, and system parameters
- Purpose: Customize classification behavior and system integration points
- Trigger: Click settings icon in header
- Progression: Open settings → Navigate tabs (Keywords, API, Learning) → Modify values → Save → See changes reflected
- Success criteria: Settings persist, validation prevents invalid inputs, clear success/error feedback

**Classification Statistics Dashboard**
- Functionality: Display real-time metrics on classification accuracy, article counts, prototype drift
- Purpose: Provide transparency into system learning and performance
- Trigger: View stats panel in header or dedicated dashboard view
- Progression: System processes articles → Metrics update in real-time → User views classification confidence → Identifies patterns
- Success criteria: Live updates, clear data visualization, performance indicators

## Edge Case Handling

- **No Articles Available**: Display elegant empty state with illustration and prompt to add topics or wait for ingestion
- **Network/API Failure**: Show connection status indicator, queue operations for retry, toast error notifications
- **Invalid Topic Names**: Prevent duplicates, special characters, validate length before adding
- **Rapid Reassignments**: Debounce prototype updates, show loading state, prevent double-clicks
- **Prototype Initialization**: Handle first-run state with default prototypes, seed data for demo

## Design Direction

The interface should evoke a high-tech cyber operations center - metallic surfaces with deep blacks, electric accent colors, and precision engineering. Users should feel like they're operating advanced AI-powered intelligence software with professional-grade tools. Think classified military UI meets sleek automotive dashboard - serious, powerful, and unmistakably futuristic.

## Color Selection

A dark metallic palette with electric accents creating a cyber-intelligence aesthetic.

- **Primary Color**: Deep Metallic Blue `oklch(0.25 0.08 250)` - Communicates technical authority and cyber sophistication
- **Secondary Colors**: 
  - Charcoal Steel `oklch(0.18 0.01 240)` for cards and elevated surfaces
  - Midnight Black `oklch(0.12 0.01 240)` for deep backgrounds
- **Accent Color**: Electric Cyan `oklch(0.72 0.15 195)` - High-tech highlights for CTAs and active states
- **Foreground/Background Pairings**: 
  - Background (Midnight Black #1A1D26): Bright Cyan (#6DD4F2) - Ratio 8.2:1 ✓
  - Card (Charcoal Steel #282D3A): Electric Cyan (#6DD4F2) - Ratio 7.1:1 ✓
  - Primary (Metallic Blue #353F5C): White (#FFFFFF) - Ratio 8.9:1 ✓
  - Accent (Electric Cyan #6DD4F2): Midnight Black (#1A1D26) - Ratio 8.2:1 ✓

## Font Selection

Typefaces should convey technical precision and futuristic sophistication - monospace for data, geometric sans for interface elements.

- **Typographic Hierarchy**: 
  - H1 (App Title): Orbitron Bold/32px/tight tracking (0.02em) - Futuristic header
  - H2 (Section Headers): Rajdhani SemiBold/24px/normal - Strong section breaks
  - H3 (Card Titles): Rajdhani Medium/18px/normal - Article headlines
  - Body (Article Text): Inter Regular/15px/relaxed (1.6 line-height) - Readable content
  - Metadata (Timestamps, Sources): JetBrains Mono Regular/13px/wide tracking (0.05em) - Technical data
  - UI Labels: Rajdhani Medium/14px/normal - Interface controls

## Animations

Animations should feel precise and technical - mechanical transitions with cyber-glitch effects for state changes. Use subtle metallic shimmers on hover, instant feedback on clicks, and smooth but purposeful transitions between views (200-300ms with easing). Classification changes should include a brief "scanning" animation. Empty states should have gentle ambient motion. Avoid bouncy/organic easing - prefer cubic-bezier curves that feel engineered.

## Component Selection

- **Components**: 
  - Tabs (shadcn) for Good/Bad news switching with metallic underline indicator
  - Card (shadcn) for article display with custom steel-gradient backgrounds
  - Button (shadcn) with cyber-styled variants (primary: glowing cyan, secondary: outlined steel)
  - Dialog (shadcn) for settings with dark glassmorphic overlay
  - Badge (shadcn) for classification scores and metadata tags
  - Separator (shadcn) with gradient metallic dividers
  - Switch (shadcn) for boolean settings with electric glow effect
  - Input (shadcn) with cyan focus rings and subtle steel borders
  - Scroll Area (shadcn) for infinite feed virtualization
  - Toast (sonner) with cyber-styled success/error states

- **Customizations**: 
  - Custom sidebar component with collapsible topic tree and metallic gradient background
  - Custom article card with classification confidence meter and quick-action buttons
  - Custom stats widget showing real-time classification metrics with animated counters
  - Custom empty state illustrations with cyber-grid patterns

- **States**: 
  - Buttons: Default (steel gradient), Hover (cyan glow + lift), Active (pressed inset), Disabled (dimmed 40% opacity)
  - Cards: Default (subtle steel), Hover (cyan border glow), Selected (full cyan accent border)
  - Inputs: Default (steel border), Focus (cyan ring + border), Error (red glow), Success (green pulse)
  - Classification badges: Good (green with pulse), Bad (red with pulse), Neutral (gray steel)

- **Icon Selection**: 
  - @phosphor-icons/react in "duotone" weight for visual depth
  - Plus/Minus for topic management
  - ThumbsUp/ThumbsDown for classification reassignment
  - Lightning for AI processing indicators
  - GearSix for settings
  - ChartLine for statistics
  - Newspaper for article icons
  - Circle with colors for classification status dots

- **Spacing**: 
  - Container padding: px-6 py-4
  - Card gaps: gap-4
  - Section margins: mb-8
  - Inline elements: gap-2
  - Grid columns: gap-6

- **Mobile**: 
  - Sidebar collapses to drawer with hamburger menu
  - Tabs remain horizontal but compress labels
  - Cards stack vertically with full width
  - Stats move to dedicated mobile view tab
  - Two-column grid becomes single column below 768px
  - Touch targets minimum 44px for all interactive elements
