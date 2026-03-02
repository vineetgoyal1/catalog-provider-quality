import { countWords, isGoodQuality } from './src/utils/wordCount';

// Test countWords function
console.log("=== Testing countWords ===");
console.log('countWords("Hello world"):', countWords("Hello world")); // Should be 2
console.log('countWords(null):', countWords(null)); // Should be 0
console.log('countWords(undefined):', countWords(undefined)); // Should be 0
console.log('countWords(""):', countWords("")); // Should be 0
console.log('countWords("  multiple   spaces  "):', countWords("  multiple   spaces  ")); // Should be 2
console.log('countWords("one"):', countWords("one")); // Should be 1
console.log('countWords("   "):', countWords("   ")); // Should be 0

// Test isGoodQuality function
console.log("\n=== Testing isGoodQuality ===");

// Create 30-word description (should be false - need > 30)
const thirty = "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two twenty-three twenty-four twenty-five twenty-six twenty-seven twenty-eight twenty-nine thirty";
console.log(`isGoodQuality(30 words): ${isGoodQuality(thirty)}`); // Should be false

// Create 31-word description (should be true)
const thirtyOne = thirty + " thirty-one";
console.log(`isGoodQuality(31 words): ${isGoodQuality(thirtyOne)}`); // Should be true

// Edge cases
console.log(`isGoodQuality(null): ${isGoodQuality(null)}`); // Should be false
console.log(`isGoodQuality(""): ${isGoodQuality("")}`); // Should be false
