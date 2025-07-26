const fs = require('fs');
const path = require('path');
const { analyzeQuote } = require('./analyze-quotes');

async function testAnalysis() {
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY environment variable is not set');
      console.log('Please set your OpenAI API key:');
      console.log('export OPENAI_API_KEY="your-api-key-here"');
      process.exit(1);
    }

    // Test quotes
    const testQuotes = [
      {
        quote: "In the end the shape and form don't matter at all, it's only the soul that matters, right? Nothing else.",
        character: "Soul Eater",
        anime: "Soul Eater"
      },
      {
        quote: "Never trust anyone too much... Remember the devil was once an angel...",
        character: "Kaneki Ken",
        anime: "Tokyo Ghoul √A"
      },
      {
        quote: "If I try, I fail. If i don't try i'm never going to get it.",
        character: "Aang",
        anime: "Avatar: The Last Airbender"
      }
    ];

    console.log('🧪 Testing quote analysis with 3 sample quotes...\n');

    for (let i = 0; i < testQuotes.length; i++) {
      const quote = testQuotes[i];
      console.log(`Testing quote ${i + 1}:`);
      console.log(`"${quote.quote}"`);
      console.log(`Character: ${quote.character}`);
      console.log(`Anime: ${quote.anime}`);
      
      try {
        const analysis = await analyzeQuote(quote.quote, quote.character, quote.anime);
        console.log('✅ Analysis result:');
        console.log(`  Sentiment Score: ${analysis.sentiment_score}/10`);
        console.log(`  Sentiment Label: ${analysis.sentiment_label}`);
        console.log(`  Tags: ${analysis.tags.join(', ')}`);
        
        // Calculate emotion from the analysis
        const { deriveEmotion } = require('./analyze-quotes');
        const emotion = deriveEmotion(analysis.sentiment_label, analysis.tags);
        console.log(`  Emotion: ${emotion}`);
      } catch (error) {
        console.log('❌ Analysis failed:', error.message);
      }
      
      console.log('---\n');
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🎉 Test completed! If all tests passed, you can run the full analysis with:');
    console.log('npm run analyze-quotes');

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testAnalysis();
} 