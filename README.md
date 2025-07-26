# Quote Search

A modern, responsive web application for discovering and saving your favorite fictional quotes from anime, movies, books, and more. Built with Next.js, TypeScript, and Algolia search.

## Features

- 🔍 **Advanced Search**: Powered by Algolia for fast, relevant search results
- 💾 **Save Favorites**: Bookmark and save your favorite quotes locally
- 🏷️ **Smart Filtering**: Filter by character, emotion, and tags
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations
- 📊 **Sentiment Analysis**: Each quote includes sentiment scoring and emotion classification
- 🔗 **Social Sharing**: Share quotes directly to Twitter
- 📋 **Copy to Clipboard**: Easy one-click copying of quotes

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Search**: Algolia InstantSearch.js
- **UI Components**: Custom components with shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks with localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Algolia account and index

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd quote-search
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
   NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
   NEXT_PUBLIC_ALGOLIA_INDEX_NAME=your_index_name
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Data Structure

Each quote in the system has the following structure:

```typescript
interface Quote {
  objectID: string;
  quote: string;
  character: string;
  anime: string;
  emotion: string;
  tags: string[];
  sentiment_score: number;
  sentiment_label: string;
}
```

### Example Quote

```json
{
  "objectID": "1",
  "quote": "I'm not a hero because I want your approval. I'm a hero because I want to help people.",
  "character": "Saitama",
  "anime": "One Punch Man",
  "emotion": "Inspiring",
  "tags": ["heroism", "justice", "self-worth"],
  "sentiment_score": 8,
  "sentiment_label": "positive"
}
```

## Emotion Categories

The application supports various emotion categories with color-coded badges:

### Positive Emotions

- **Inspiring** - Courage, bravery, determination
- **Romantic** - Love, romance
- **Warm** - Friendship, family
- **Joyful** - Joy, happiness, celebration
- **Hopeful** - Hope, optimism, dreams
- **Serene** - Peace, calm, tranquility
- **Energetic** - Excitement, adventure, passion
- **Humorous** - Humor, comedy, wit
- **Noble** - Justice, morality, honor
- **Liberating** - Freedom, rebellion, independence
- **Futuristic** - Technology, science, innovation
- **Spiritual** - Spirituality, religion, faith

### Neutral/Reflective Emotions

- **Philosophical** - Wisdom, philosophy, truth
- **Reflective** - Time, change, growth
- **Mysterious** - Mystery, secrets, intrigue
- **Nostalgic** - Memories, past, nostalgia

### Negative Emotions

- **Tragic** - Heartbreak, betrayal, death
- **Melancholic** - Sadness, grief, loss
- **Terrifying** - Fear, horror
- **Dark** - Darkness, evil
- **Furious** - Anger, rage
- **Intense** - War, battle, conflict
- **Ambitious** - Power, ambition, leadership
- **Complex** - Mixed emotions

## Algolia Setup

1. **Create an Algolia account** at [algolia.com](https://www.algolia.com)
2. **Create a new application**
3. **Create an index** for your quotes
4. **Upload your quotes data** to the index
5. **Configure search settings** (optional)
6. **Get your API keys** and add them to `.env.local`

## Scripts

The project includes several utility scripts in the `scripts/` directory:

- `analyze-quotes.js` - Add sentiment analysis and tags to quotes
- `test-analysis.js` - Test the analysis with a small sample
- `example-enhanced-usage.js` - Demo of enhanced quote features

See [scripts/README.md](scripts/README.md) for detailed information about the analysis scripts.

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Analysis (see scripts/README.md for details)
npm run analyze-quotes    # Process quotes with sentiment analysis
npm run test-analysis     # Test analysis with sample data
```

## Project Structure

```
quote-search/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main quote search page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── theme-provider.tsx
├── data/              # Quote data files
│   ├── quotes.json    # Main quotes data
│   └── quotes.backup.json
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── scripts/           # Analysis and utility scripts
├── styles/            # Additional styles
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Algolia](https://www.algolia.com) for powerful search capabilities
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [Lucide](https://lucide.dev) for beautiful icons
