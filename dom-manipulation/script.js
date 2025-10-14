// ========== Initial Data ==========
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" }
];

// ========== DOM Elements ==========
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// ========== Functions ==========

// Display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Please add one!</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear previous content
  quoteDisplay.innerHTML = "";

  // Create elements dynamically
  const quoteText = document.createElement('p');
  quoteText.textContent = `"${quote.text}"`;

  const categoryText = document.createElement('p');
  categoryText.classList.add('category');
  categoryText.textContent = `Category: ${quote.category}`;

  // Append new quote
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(categoryText);
}

// Add a new quote dynamically
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    alert("Please fill in both fields!");
    return;
  }

  // Create new quote object
  const newQuote = { text, category };

  // Add to array
  quotes.push(newQuote);

  // Clear input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Feedback
  alert("Quote added successfully!");
  showRandomQuote(); // Show the new quote
}

// ========== Event Listeners ==========
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);

// Show one quote when the page loads
showRandomQuote();
