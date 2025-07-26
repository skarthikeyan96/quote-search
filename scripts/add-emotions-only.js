const fs = require('fs');
const path = require('path');

// Tag to emotion mapping (same as in analyze-quotes.js)
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

// Main function to add emotions to quotes
async function addEmotionsToQuotes() {
  try {
    // Read the quotes file
    const quotesPath = path.join(__dirname, '..', 'data', 'quotes.json');
    console.log('Reading quotes from:', quotesPath);
    
    const quotesData = fs.readFileSync(quotesPath, 'utf8');
    const quotes = JSON.parse(quotesData);
    
    console.log(`Found ${quotes.length} quotes to process`);
    
    // Check if quotes already have sentiment analysis
    const hasSentimentAnalysis = quotes[0] && quotes[0].sentiment_score !== undefined;
    
    if (!hasSentimentAnalysis) {
      console.log('❌ Quotes do not have sentiment analysis. Please run the full analysis first:');
      console.log('npm run analyze-quotes');
      return;
    }
    
    // Check if quotes already have emotions
    const hasEmotions = quotes[0] && quotes[0].emotion !== undefined;
    
    if (hasEmotions) {
      console.log('✅ Quotes already have emotions. Skipping...');
      return;
    }
    
    // Create backup
    const backupPath = path.join(__dirname, '..', 'data', 'quotes.backup.json');
    fs.writeFileSync(backupPath, quotesData);
    console.log(`Backup created at: ${backupPath}`);
    
    // Add emotions to each quote
    let processedCount = 0;
    const enhancedQuotes = quotes.map((quote, index) => {
      const emotion = deriveEmotion(quote.sentiment_label, quote.tags);
      const enhancedQuote = {
        ...quote,
        emotion: emotion
      };
      
      processedCount++;
      if (processedCount % 1000 === 0) {
        console.log(`Processed ${processedCount}/${quotes.length} quotes...`);
      }
      
      return enhancedQuote;
    });
    
    // Write enhanced quotes back to file
    const enhancedQuotesPath = path.join(__dirname, '..', 'data', 'quotes.json');
    fs.writeFileSync(enhancedQuotesPath, JSON.stringify(enhancedQuotes, null, 2));
    
    console.log(`✅ Successfully added emotions to ${enhancedQuotes.length} quotes`);
    console.log(`Enhanced quotes saved to: ${enhancedQuotesPath}`);
    
    // Generate emotion statistics
    const emotionStats = {};
    enhancedQuotes.forEach(quote => {
      emotionStats[quote.emotion] = (emotionStats[quote.emotion] || 0) + 1;
    });
    
    console.log('\n📊 Emotion Distribution:');
    Object.entries(emotionStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([emotion, count]) => {
        const percentage = ((count / enhancedQuotes.length) * 100).toFixed(1);
        console.log(`  ${emotion}: ${count} quotes (${percentage}%)`);
      });
    
    console.log('\n🎉 Emotion addition completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addEmotionsToQuotes();
}

module.exports = { deriveEmotion, addEmotionsToQuotes }; 