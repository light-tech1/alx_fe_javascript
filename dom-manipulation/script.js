let quotes = [];
let categories = [];
let filteredCategory = "all";

// Load quotes and categories from Local Storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  const storedCategories = localStorage.getItem("categories");
  const savedFilter = localStorage.getItem("selectedCategory");

  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Do one thing every day that scares you.", category: "Courage" }
    ];
  }

  // Extract categories from stored data or quotes
  if (storedCategories) {
    categories = JSON.parse(storedCategories);
  } else {
    categories = [...new Set(quotes.map(q => q.category))];
  }

  if (savedFilter) filteredCategory = savedFilter;
}

// Save quotes and categories
function saveData() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  localStorage.setItem("categories", JSON.stringify(categories));
}

// Populate category dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear and re-add "All" option
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  categoryFilter.value = filteredCategory;
}

// Filter quotes by category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  filteredCategory = selected;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// Show random quote (filtered)
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");

  const availableQuotes = filteredCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === filteredCategory);

  if (availableQuotes.length === 0) {
    display.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const { text, category } = availableQuotes[randomIndex];

  display.innerHTML = `
    <blockquote>"${text}"</blockquote>
    <p><em>Category: ${category}</em></p>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify({ text, category }));
}

// Add new quote + update categories + storage
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });

  // Add new category if not already in list
  if (!categories.includes(category)) {
    categories.push(category);
    populateCategories();
  }

  saveData();
  alert("Quote added successfully!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  showRandomQuote();
}

// Export quotes as JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);

        // Rebuild categories
        categories = [...new Set(quotes.map(q => q.category))];
        saveData();
        populateCategories();

        alert("Quotes imported successfully!");
        showRandomQuote();
      } else {
        alert("Invalid JSON file format!");
      }
    } catch {
      alert("Error reading JSON file!");
    }
  };
  reader.readAsText(file);
}

// Initialize
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
loadQuotes();
populateCategories();

// Restore last viewed quote
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const { text, category } = JSON.parse(lastQuote);
  document.getElementById("quoteDisplay").innerHTML = `
    <blockquote>"${text}"</blockquote>
    <p><em>Category: ${category}</em></p>
  `;
} else {
  showRandomQuote();
}
