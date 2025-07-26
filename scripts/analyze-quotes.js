const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const BATCH_SIZE = 10; // Process quotes in batches to avoid rate limits
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay between batches

// Tag to emotion mapping
const tagToEmotion = {
  // Love and relationships
  love: "Romantic",
  romance: "Romantic",
  heartbreak: "Melancholic",
  friendship: "Warm",
  family: "Warm",
  betrayal: "Tragic",
  
  // Courage and determination
  courage: "Inspiring",
  bravery: "Inspiring",
  determination: "Inspiring",
  perseverance: "Inspiring",
  strength: "Inspiring",
  heroism: "Inspiring",
  
  // Wisdom and philosophy
  wisdom: "Philosophical",
  philosophy: "Philosophical",
  truth: "Philosophical",
  meaning: "Philosophical",
  life: "Philosophical",
  existence: "Philosophical",
  
  // Fear and darkness
  fear: "Terrifying",
  horror: "Terrifying",
  death: "Tragic",
  despair: "Melancholic",
  darkness: "Dark",
  evil: "Dark",
  
  // Joy and happiness
  joy: "Joyful",
  happiness: "Joyful",
  laughter: "Joyful",
  celebration: "Joyful",
  success: "Joyful",
  
  // Anger and conflict
  anger: "Furious",
  rage: "Furious",
  war: "Intense",
  battle: "Intense",
  conflict: "Intense",
  
  // Sadness and loss
  sadness: "Melancholic",
  grief: "Melancholic",
  loss: "Melancholic",
  pain: "Melancholic",
  suffering: "Melancholic",
  
  // Hope and optimism
  hope: "Hopeful",
  optimism: "Hopeful",
  dreams: "Hopeful",
  future: "Hopeful",
  
  // Mystery and intrigue
  mystery: "Mysterious",
  secrets: "Mysterious",
  intrigue: "Mysterious",
  deception: "Mysterious",
  
  // Peace and calm
  peace: "Serene",
  calm: "Serene",
  tranquility: "Serene",
  meditation: "Serene",
  
  // Excitement and energy
  excitement: "Energetic",
  adventure: "Energetic",
  thrill: "Energetic",
  passion: "Energetic",
  
  // Humor and comedy
  humor: "Humorous",
  comedy: "Humorous",
  funny: "Humorous",
  wit: "Humorous",
  
  // Nostalgia and memories
  memories: "Nostalgic",
  past: "Nostalgic",
  childhood: "Nostalgic",
  nostalgia: "Nostalgic",
  
  // Justice and morality
  justice: "Noble",
  morality: "Noble",
  honor: "Noble",
  duty: "Noble",
  sacrifice: "Noble",
  
  // Power and ambition
  power: "Ambitious",
  ambition: "Ambitious",
  leadership: "Ambitious",
  control: "Ambitious",
  
  // Freedom and rebellion
  freedom: "Liberating",
  rebellion: "Liberating",
  independence: "Liberating",
  liberation: "Liberating",
  
  // Nature and beauty
  nature: "Serene",
  beauty: "Serene",
  art: "Serene",
  music: "Serene",
  
  // Technology and science
  technology: "Futuristic",
  science: "Futuristic",
  innovation: "Futuristic",
  progress: "Futuristic",
  
  // Spirituality and religion
  spirituality: "Spiritual",
  religion: "Spiritual",
  faith: "Spiritual",
  soul: "Spiritual",
  divine: "Spiritual",
  
  // Time and change
  time: "Reflective",
  change: "Reflective",
  growth: "Reflective",
  transformation: "Reflective",
  
  // Fate and destiny
  fate: "Mysterious",
  destiny: "Mysterious",
  prophecy: "Mysterious",
  fortune: "Mysterious"
};

// Function to derive emotion from sentiment label and tags
function deriveEmotion(sentimentLabel, tags) {
  // First, check if any tags map to specific emotions
  for (const tag of tags) {
    if (tagToEmotion[tag.toLowerCase()]) {
      return tagToEmotion[tag.toLowerCase()];
    }
  }

  // Fallback to sentiment-based emotions
  const sentimentMap = {
    positive: "Inspiring",
    neutral: "Reflective",
    negative: "Tragic",
    mixed: "Complex"
  };

  return sentimentMap[sentimentLabel] || "Neutral";
}

// Function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to analyze a single quote
async function analyzeQuote(quote, character, anime) {
  try {
    const prompt = `Analyze the following anime quote and provide:
1. A sentiment score (1-10, where 1 is very negative, 5 is neutral, 10 is very positive)
2. A list of 3-5 relevant tags that describe the theme, emotion, or topic of the quote
3. A brief sentiment label (positive, negative, neutral, mixed)

Quote: "${quote}"
Character: ${character}
Anime: ${anime}

Please respond in the following JSON format:
{
  "sentiment_score": number,
  "sentiment_label": "string",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing anime quotes for sentiment and themes. Provide accurate, relevant analysis in the specified JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error(`Error analyzing quote: ${error.message}`);
    // Return default values if analysis fails
    return {
      sentiment_score: 5,
      sentiment_label: "neutral",
      tags: ["general"]
    };
  }
}

// Function to process quotes in batches
async function processQuotesInBatches(quotes) {
  const enhancedQuotes = [];
  
  for (let i = 0; i < quotes.length; i += BATCH_SIZE) {
    const batch = quotes.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(quotes.length / BATCH_SIZE)} (quotes ${i + 1}-${Math.min(i + BATCH_SIZE, quotes.length)})`);
    
    const batchPromises = batch.map(async (quote, index) => {
      const enhancedQuote = {
        ...quote,
        sentiment_score: 5,
        sentiment_label: "neutral",
        tags: ["general"],
        emotion: "Neutral"
      };
      
      try {
        const analysis = await analyzeQuote(quote.quote, quote.character, quote.anime);
        enhancedQuote.sentiment_score = analysis.sentiment_score;
        enhancedQuote.sentiment_label = analysis.sentiment_label;
        enhancedQuote.tags = analysis.tags;
        enhancedQuote.emotion = deriveEmotion(analysis.sentiment_label, analysis.tags);
        
        console.log(`✓ Enhanced quote ${i + index + 1}: "${quote.quote.substring(0, 50)}..." (${enhancedQuote.emotion})`);
      } catch (error) {
        console.error(`✗ Failed to enhance quote ${i + index + 1}: ${error.message}`);
      }
      
      return enhancedQuote;
    });
    
    const batchResults = await Promise.all(batchPromises);
    enhancedQuotes.push(...batchResults);
    
    // Add delay between batches to avoid rate limits
    if (i + BATCH_SIZE < quotes.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }
  
  return enhancedQuotes;
}

// Main function
async function main() {
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY environment variable is not set');
      console.log('Please set your OpenAI API key:');
      console.log('export OPENAI_API_KEY="your-api-key-here"');
      process.exit(1);
    }
    
    // Read the quotes file
    const quotesPath = path.join(__dirname, '..', 'data', 'quotes.json');
    console.log('Reading quotes from:', quotesPath);
    
    const quotesData = fs.readFileSync(quotesPath, 'utf8');
    const quotes = JSON.parse(quotesData);
    
    console.log(`Found ${quotes.length} quotes to analyze`);
    
    // Check if quotes already have sentiment analysis
    const hasExistingAnalysis = quotes[0] && quotes[0].sentiment_score !== undefined;
    
    if (hasExistingAnalysis) {
      console.log('Quotes already have sentiment analysis. Skipping...');
      return;
    }
    
    // Process quotes
    const enhancedQuotes = await processQuotesInBatches(quotes);
    
    // Create backup of original file
    const backupPath = path.join(__dirname, '..', 'data', 'quotes.backup.json');
    fs.writeFileSync(backupPath, quotesData);
    console.log(`Backup created at: ${backupPath}`);
    
    // Write enhanced quotes back to file
    const enhancedQuotesPath = path.join(__dirname, '..', 'data', 'quotes.json');
    fs.writeFileSync(enhancedQuotesPath, JSON.stringify(enhancedQuotes, null, 2));
    
    console.log(`✅ Successfully enhanced ${enhancedQuotes.length} quotes with sentiment analysis and tags`);
    console.log(`Enhanced quotes saved to: ${enhancedQuotesPath}`);
    
    // Generate summary statistics
    const sentimentStats = {};
    const allTags = new Set();
    
    enhancedQuotes.forEach(quote => {
      sentimentStats[quote.sentiment_label] = (sentimentStats[quote.sentiment_label] || 0) + 1;
      quote.tags.forEach(tag => allTags.add(tag));
    });
    
    console.log('\n📊 Summary Statistics:');
    console.log('Sentiment Distribution:');
    Object.entries(sentimentStats).forEach(([label, count]) => {
      console.log(`  ${label}: ${count} quotes (${((count / enhancedQuotes.length) * 100).toFixed(1)}%)`);
    });
    
    console.log(`\nTotal unique tags: ${allTags.size}`);
    console.log('Top tags:', Array.from(allTags).slice(0, 10).join(', '));
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { analyzeQuote, processQuotesInBatches, deriveEmotion }; 