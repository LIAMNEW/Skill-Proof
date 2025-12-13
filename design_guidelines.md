# SkillProof Design Guidelines

## Design Approach
**Reference-Based + Dark Gradient System**: Modern recruiting platform inspired by Linear's polish and Stripe's restraint, with a sophisticated dark aesthetic that conveys technical credibility.

## Core Visual Identity

### Color System
- **Background**: Gradient from slate-900 through purple-900 back to slate-900 (diagonal)
- **Cards/Containers**: White at 10% opacity with backdrop blur (glass morphism)
- **Borders**: White at 20% opacity
- **Accent Colors**: Purple-400, Blue-400, Green-400
- **Text**: White primary, Gray-300 secondary
- **Status Colors**: 
  - Green for positive/matching elements
  - Orange for gaps/missing elements  
  - Red for rejections
  - Yellow for caution/interview state

### Typography
- **Headings**: Bold, large gradient text effects for main titles
- **Body**: Clean, readable sans-serif
- **Emphasis**: Use color gradients for key metrics and scores

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
- GitHub icon + "SkillProof" branding
- Tagline: "Real skills from real code. No more credential inflation."
- Gradient text treatment on title

### Profile Analyzer Section
- Input field for GitHub username with example placeholder text
- Primary action button with loading spinner animation
- Loading states show progressive messages ("Fetching profile...", "Analyzing code...")

### Profile Results Display
- **Profile Header Card**: Avatar (circular), name, bio, repository count, followers count
- **Language Distribution Chart**: Horizontal bars with percentages, each language bar with distinct color and smooth width animation
- **Skills Grid**: 3-column responsive grid of skill badges showing proficiency levels (Expert/Intermediate/Beginner)
- **Experience Summary**: Purple-accented card containing AI-generated summary

### Job Matcher Section  
- Large textarea for job description input
- Prominent "Calculate Match Score" button
- Clear visual separation from profile results above

### Match Results Display
- **Hero Score**: Giant centered percentage with gradient styling
- **Recommendation Badge**: Color-coded (GREEN=HIRE, YELLOW=INTERVIEW, RED=PASS)
- **Two-Column Layout**:
  - Left: Matching skills as green tags
  - Right: Missing skills as orange tags
- **Strengths Card**: Bulleted list highlighting candidate advantages
- **Analysis Card**: Purple-boxed AI reasoning explanation

## Visual Effects & Interactions

### Animations (Minimal & Purposeful)
- Fade-in transitions for results (500ms duration)
- Language bar width animations (700ms duration)
- Button hover scale effects (scale-105)
- Loading spinner rotation
- Smooth transitions on all interactive elements

### Icons
- Use Lucide-react throughout: Github, Search, Code, Briefcase, Award, TrendingUp
- Consistent sizing and spacing

### Glass Morphism Effect
- All containers use backdrop-blur with semi-transparent backgrounds
- Layered depth through blur intensity variations

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
- Large, readable match score displays
- Color-coded skill comparison (matching vs. missing)

## Images
No hero images required - dark gradient background provides visual impact. Profile avatars from GitHub API are the primary imagery.