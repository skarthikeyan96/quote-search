// Example of how to use the enhanced quotes data
// This shows how to filter by sentiment, search by tags, and create sentiment-based UI

const fs = require('fs');
const path = require('path');

// Load enhanced quotes (after running the analysis script)
function loadEnhancedQuotes() {
  try {
    const quotesPath = path.join(__dirname, '..', 'data', 'quotes.json');
    const quotesData = fs.readFileSync(quotesPath, 'utf8');
    return JSON.parse(quotesData);
  } catch (error) {
    console.error('Error loading quotes:', error.message);
    return [];
  }
}

// Filter quotes by sentiment
function filterBySentiment(quotes, sentimentLabel) {
  return quotes.filter(quote => quote.sentiment_label === sentimentLabel);
}

// Filter quotes by emotion
function filterByEmotion(quotes, emotion) {
  return quotes.filter(quote => quote.emotion === emotion);
}

// Filter quotes by sentiment score range
function filterBySentimentScore(quotes, minScore, maxScore) {
  return quotes.filter(quote => 
    quote.sentiment_score >= minScore && quote.sentiment_score <= maxScore
  );
}

// Search quotes by tags
function searchByTags(quotes, searchTags) {
  return quotes.filter(quote => 
    searchTags.some(tag => 
      quote.tags.some(quoteTag => 
        quoteTag.toLowerCase().includes(tag.toLowerCase())
      )
    )
  );
}

// Get all unique tags
function getAllTags(quotes) {
  const allTags = new Set();
  quotes.forEach(quote => {
    quote.tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
}

// Get sentiment statistics
function getSentimentStats(quotes) {
  const stats = {
    positive: 0,
    negative: 0,
    neutral: 0,
    mixed: 0,
    averageScore: 0
  };
  
  quotes.forEach(quote => {
    stats[quote.sentiment_label] = (stats[quote.sentiment_label] || 0) + 1;
  });
  
  const totalScore = quotes.reduce((sum, quote) => sum + quote.sentiment_score, 0);
  stats.averageScore = totalScore / quotes.length;
  
  return stats;
}

// Get emotion statistics
function getEmotionStats(quotes) {
  const stats = {};
  quotes.forEach(quote => {
    stats[quote.emotion] = (stats[quote.emotion] || 0) + 1;
  });
  return stats;
}

// Example usage
function demonstrateEnhancedFeatures() {
  console.log('🎯 Enhanced Quote Search Features Demo\n');
  
  const quotes = loadEnhancedQuotes();
  
  if (quotes.length === 0) {
    console.log('No quotes found. Please run the analysis script first:');
    console.log('npm run analyze-quotes');
    return;
  }
  
  console.log(`📊 Total quotes: ${quotes.length}\n`);
  
  // Show sentiment statistics
  const stats = getSentimentStats(quotes);
  console.log('📈 Sentiment Distribution:');
  console.log(`  Positive: ${stats.positive} quotes`);
  console.log(`  Negative: ${stats.negative} quotes`);
  console.log(`  Neutral: ${stats.neutral} quotes`);
  console.log(`  Mixed: ${stats.mixed} quotes`);
  console.log(`  Average sentiment score: ${stats.averageScore.toFixed(2)}/10\n`);
  
  // Show some positive quotes
  const positiveQuotes = filterBySentiment(quotes, 'positive').slice(0, 3);
  console.log('😊 Sample Positive Quotes:');
  positiveQuotes.forEach((quote, index) => {
    console.log(`  ${index + 1}. "${quote.quote.substring(0, 60)}..."`);
    console.log(`     Score: ${quote.sentiment_score}/10, Tags: ${quote.tags.join(', ')}\n`);
  });
  
  // Show some negative quotes
  const negativeQuotes = filterBySentiment(quotes, 'negative').slice(0, 3);
  console.log('😔 Sample Negative Quotes:');
  negativeQuotes.forEach((quote, index) => {
    console.log(`  ${index + 1}. "${quote.quote.substring(0, 60)}..."`);
    console.log(`     Score: ${quote.sentiment_score}/10, Tags: ${quote.tags.join(', ')}\n`);
  });
  
  // Show quotes with high sentiment scores
  const highSentimentQuotes = filterBySentimentScore(quotes, 8, 10).slice(0, 3);
  console.log('🌟 High Sentiment Quotes (8-10):');
  highSentimentQuotes.forEach((quote, index) => {
    console.log(`  ${index + 1}. "${quote.quote.substring(0, 60)}..."`);
    console.log(`     Score: ${quote.sentiment_score}/10, Label: ${quote.sentiment_label}\n`);
  });
  
  // Show quotes by tag
  const loveQuotes = searchByTags(quotes, ['love']).slice(0, 3);
  console.log('💕 Love-themed Quotes:');
  loveQuotes.forEach((quote, index) => {
    console.log(`  ${index + 1}. "${quote.quote.substring(0, 60)}..."`);
    console.log(`     Tags: ${quote.tags.join(', ')}, Emotion: ${quote.emotion}\n`);
  });
  
  // Show quotes by emotion
  const inspiringQuotes = filterByEmotion(quotes, 'Inspiring').slice(0, 3);
  console.log('🌟 Inspiring Quotes:');
  inspiringQuotes.forEach((quote, index) => {
    console.log(`  ${index + 1}. "${quote.quote.substring(0, 60)}..."`);
    console.log(`     Sentiment: ${quote.sentiment_score}/10, Tags: ${quote.tags.join(', ')}\n`);
  });
  
  // Show all available tags
  const allTags = getAllTags(quotes);
  console.log(`🏷️  Available Tags (${allTags.length} total):`);
  console.log(allTags.slice(0, 20).join(', '));
  if (allTags.length > 20) {
    console.log(`... and ${allTags.length - 20} more`);
  }
  
  // Show emotion distribution
  const emotionStats = getEmotionStats(quotes);
  console.log('😊 Emotion Distribution:');
  Object.entries(emotionStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([emotion, count]) => {
      console.log(`  ${emotion}: ${count} quotes`);
    });
  
  console.log('\n✨ These enhanced features enable:');
  console.log('  • Filtering quotes by emotional tone');
  console.log('  • Finding quotes with specific themes');
  console.log('  • Creating mood-based quote collections');
  console.log('  • Building sentiment-aware search');
  console.log('  • Generating tag-based recommendations');
  console.log('  • Emotion-based quote discovery');
}

// Run the demo
if (require.main === module) {
  demonstrateEnhancedFeatures();
}

module.exports = {
  loadEnhancedQuotes,
  filterBySentiment,
  filterByEmotion,
  filterBySentimentScore,
  searchByTags,
  getAllTags,
  getSentimentStats,
  getEmotionStats
}; 