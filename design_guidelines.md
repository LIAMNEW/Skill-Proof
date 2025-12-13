# SkillProof Design Guidelines

## Design Approach
**Noir & Gold Theme**: Sophisticated dark theme with elegant gold accents that conveys technical credibility and premium quality for hackathon presentation to judges from OpenAI, Meta, Canva, Atlassian, and Pearler.

## Core Visual Identity

### Color System
- **Background**: Dark charcoal gradient from #0a0a0f via #12121a to #1a1a24 (diagonal)
- **Cards/Containers**: White at 5% opacity with backdrop blur (glass morphism)
- **Borders**: Amber-500 at 20% opacity for subtle gold accent
- **Primary Accent**: Gold/Amber - amber-400, amber-500, yellow-300 for gradients
- **Buttons**: Gold (amber-500) with dark text (slate-900)
- **Text Primary**: White
- **Text Secondary**: Gray-300, Gray-400
- **Status Colors**: 
  - Green for positive/matching elements
  - Orange for gaps/missing elements  
  - Red for rejections
  - Yellow for caution/interview state

### Typography
- **Headings**: Bold, large gradient text effects using gold-amber gradient
- **Body**: Clean, readable sans-serif in white/gray
- **Emphasis**: Use gold gradients for key metrics and scores

### Layout System
- **Spacing**: Tailwind units - generous padding for breathing room
- **Corners**: rounded-2xl for all cards and containers
- **Grid Systems**: 
  - 3-column grids for skill badges (desktop)
  - 2-column for match analysis sections
  - Single column stack on mobile

## Component Design Specifications

### Header Component
- Centered layout
- GitHub icon in amber-400 + "SkillProof" branding with gold gradient
- Tagline: "Real skills from real code. No more credential inflation."
- Gold gradient text treatment on title (from-amber-400 via-yellow-300 to-amber-400)

### Profile Analyzer Section
- Input field for GitHub username with example placeholder text
- Gold primary action button (bg-amber-500 with slate-900 text)
- Loading states show progressive messages
- Card border: amber-500/20

### Profile Results Display
- **Profile Header Card**: Avatar with amber-400/50 border, name, bio, repository count, followers count
- **Language Distribution Chart**: Horizontal bars with percentages, each language bar with distinct color and smooth width animation, amber icon
- **Skills Grid**: 3-column responsive grid of skill badges showing proficiency levels, amber icon
- **Experience Summary**: Amber-accented card with gradient background (from-amber-900/30 to-amber-800/20)

### Job Matcher Section  
- Large textarea for job description input
- Prominent gold "Calculate Match Score" button
- Clear visual separation from profile results above
- Briefcase icon in amber-400

### Match Results Display
- **Hero Score**: Giant centered percentage with gold gradient (from-amber-400 via-yellow-300 to-amber-500)
- **Recommendation Badge**: Color-coded (GREEN=HIRE, YELLOW=INTERVIEW, RED=PASS)
- **Two-Column Layout**:
  - Left: Matching skills as green tags
  - Right: Missing skills as orange tags
- **Strengths Card**: Bulleted list highlighting candidate advantages
- **Analysis Card**: Amber-accented card with AI reasoning explanation

## Visual Effects & Interactions

### Animations (Minimal & Purposeful)
- Fade-in transitions for results (500ms duration)
- Language bar width animations (700ms duration)
- Button hover scale effects (scale-105)
- Loading spinner rotation
- Smooth transitions on all interactive elements

### Icons
- Use Lucide-react throughout: Github, Search, Code, Briefcase, Award, TrendingUp
- Primary icon color: amber-400
- Consistent sizing and spacing

### Glass Morphism Effect
- All containers use backdrop-blur with semi-transparent backgrounds (white/5)
- Layered depth through blur intensity variations
- Gold-tinted borders (amber-500/20)

## Responsive Behavior
- **Desktop**: Multi-column grids, side-by-side card layouts
- **Tablet**: 2-column grids, maintained spacing
- **Mobile**: Single column stack, full-width buttons, optimized padding

Breakpoints: `md:grid-cols-2`, `lg:grid-cols-3`, `sm:flex-row`

## Error & Loading States
- Red card backgrounds for error messages
- Animated spinners during processing
- Helpful error text with retry options
- Progressive loading messages to maintain engagement

## Data Visualization
- Language percentage bars with smooth animation
- Visual proficiency indicators on skill badges
- Large, readable match score displays with gold gradient
- Color-coded skill comparison (matching vs. missing)

## Images
No hero images required - dark charcoal gradient background provides visual impact. Profile avatars from GitHub API are the primary imagery.
