# Quote Analysis Script

This script uses OpenAI's GPT to analyze anime quotes and add sentiment analysis and tags to each quote.

## Features

- **Sentiment Analysis**: Analyzes the emotional tone of each quote (1-10 scale)
- **Sentiment Labels**: Categorizes quotes as positive, negative, neutral, or mixed
- **Tags**: Adds 3-5 relevant tags describing themes, emotions, or topics
- **Emotion Classification**: Derives specific emotions (Romantic, Inspiring, Tragic, etc.) from tags and sentiment
- **Batch Processing**: Processes quotes in batches to avoid API rate limits
- **Backup**: Creates a backup of the original quotes file before processing
- **Error Handling**: Gracefully handles API errors and continues processing

## Setup

1. **Install Dependencies**:

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set OpenAI API Key**:

   ```bash
   export OPENAI_API_KEY="your-openai-api-key-here"
   ```

   You can get an API key from [OpenAI's platform](https://platform.openai.com/api-keys).

## Usage

### Test the Analysis (Recommended First Step)

Test the script with a small sample before processing all quotes:

```bash
npm run test-analysis
```

### Run Full Analysis

Process all quotes with sentiment analysis and tags:

```bash
npm run analyze-quotes
```

Or run it directly:

```bash
node scripts/analyze-quotes.js
```

### See Enhanced Features Demo

After running the analysis, see how to use the enhanced data:

```bash
node scripts/example-enhanced-usage.js
```

## What the Script Does

1. **Reads** the `data/quotes.json` file
2. **Checks** if quotes already have sentiment analysis (skips if they do)
3. **Processes** quotes in batches of 10 to avoid rate limits
4. **Creates** a backup of the original file as `data/quotes.backup.json`
5. **Enhances** each quote with:
   - `sentiment_score`: 1-10 scale (1=very negative, 5=neutral, 10=very positive)
   - `sentiment_label`: "positive", "negative", "neutral", or "mixed"
   - `tags`: Array of 3-5 relevant tags
   - `emotion`: Specific emotion derived from tags and sentiment (e.g., "Romantic", "Inspiring", "Tragic")
6. **Saves** the enhanced quotes back to `data/quotes.json`
7. **Displays** summary statistics

## Example Output

After running the script, your quotes will look like this:

```json
{
  "quote": "In the end the shape and form don't matter at all, it's only the soul that matters, right? Nothing else.",
  "character": "Soul Eater",
  "anime": "Soul Eater",
  "sentiment_score": 7,
  "sentiment_label": "positive",
  "tags": ["philosophy", "soul", "meaning", "spirituality"],
  "emotion": "Spiritual"
}
```

## Configuration

You can modify these settings in the script:

- `BATCH_SIZE`: Number of quotes to process simultaneously (default: 10)
- `DELAY_BETWEEN_BATCHES`: Delay in milliseconds between batches (default: 2000ms)
- `temperature`: GPT model temperature for more/less creative responses (default: 0.3)

## Cost Estimation

With ~41,000 quotes and GPT-3.5-turbo:

- Each quote analysis uses ~200 tokens
- Total estimated cost: ~$2-5 USD
- Processing time: ~2-3 hours (with rate limiting)

## Troubleshooting

- **API Key Error**: Make sure your `OPENAI_API_KEY` environment variable is set
- **Rate Limit Errors**: The script includes delays between batches, but you may need to increase `DELAY_BETWEEN_BATCHES`
- **JSON Parse Errors**: If GPT returns malformed JSON, the script will use default values
- **File Not Found**: Make sure `data/quotes.json` exists in the project root

## Available Emotions

The script can derive the following emotions based on tags and sentiment:

**Positive Emotions:**

- **Inspiring** - Courage, bravery, determination, perseverance, strength, heroism
- **Romantic** - Love, romance
- **Warm** - Friendship, family
- **Joyful** - Joy, happiness, laughter, celebration, success
- **Hopeful** - Hope, optimism, dreams, future
- **Serene** - Peace, calm, tranquility, meditation, nature, beauty, art, music
- **Energetic** - Excitement, adventure, thrill, passion
- **Humorous** - Humor, comedy, funny, wit
- **Noble** - Justice, morality, honor, duty, sacrifice
- **Liberating** - Freedom, rebellion, independence, liberation
- **Futuristic** - Technology, science, innovation, progress
- **Spiritual** - Spirituality, religion, faith, soul, divine

**Neutral/Reflective Emotions:**

- **Philosophical** - Wisdom, philosophy, truth, meaning, life, existence
- **Reflective** - Time, change, growth, transformation
- **Mysterious** - Mystery, secrets, intrigue, deception, fate, destiny, prophecy, fortune
- **Nostalgic** - Memories, past, childhood, nostalgia

**Negative Emotions:**

- **Tragic** - Heartbreak, betrayal, death, despair
- **Melancholic** - Sadness, grief, loss, pain, suffering
- **Terrifying** - Fear, horror
- **Dark** - Darkness, evil
- **Furious** - Anger, rage
- **Intense** - War, battle, conflict
- **Ambitious** - Power, ambition, leadership, control
- **Complex** - Mixed emotions

## Safety Features

- Creates automatic backup before processing
- Skips processing if quotes already have sentiment analysis
- Graceful error handling for individual quote failures
- Continues processing even if some quotes fail
