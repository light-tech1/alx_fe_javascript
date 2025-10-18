let quotes = [];

// Load quotes from local storage or use default English quotes
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Do one thing every day that scares you.", category: "Inspiration" }
    ];
  }

  populateCategories();
  displayQuotes();
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Create the Add Quote form dynamically
function createAddQuoteForm() {
  const container = document.getElementById("addQuoteSection");

  container.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// Populate the category dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="All">All Categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
    filterByCategory(lastFilter);
  }
}

// Display quotes (all or filtered)
function displayQuotes(filteredQuotes = quotes) {
  const list = document.getElementById("quoteList");
  list.innerHTML = "";

  if (filteredQuotes.length === 0) {
    list.innerHTML = "<li>No quotes found for this category.</li>";
    return;
  }

  filteredQuotes.forEach(q => {
    const li = document.createElement("li");
    li.innerHTML = `"${q.text}" <em>(${q.category})</em>`;
    list.appendChild(li);
  });
}

// Filter quotes by category
function filterByCategory(category) {
  localStorage.setItem("selectedCategory", category);

  if (category === "All") {
    displayQuotes(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === category);
    displayQuotes(filtered);
  }
}

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes available.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `
    <blockquote>"${text}"</blockquote>
    <p><em>Category: ${category}</em></p>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify({ text, category }));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  alert("Quote added successfully!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  populateCategories();
  const selected = document.getElementById("categoryFilter").value;
  filterByCategory(selected);
  showRandomQuote();
}

// Export quotes to a JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        const selected = document.getElementById("categoryFilter").value;
        filterByCategory(selected);
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch {
      alert("Error reading JSON file!");
    }
  };
  reader.readAsText(file);
}

// ✅ Fetch quotes from a mock server (English)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Convert posts to quote objects with English titles
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title.charAt(0).toUpperCase() + post.title.slice(1),
      category: "Server"
    }));

    quotes.push(...serverQuotes);
    saveQuotes();
    populateCategories();
    const selected = document.getElementById("categoryFilter").value;
    filterByCategory(selected);
    console.log("Quotes synced with server!");
  } catch (error) {
    console.error("Error fetching server quotes:", error);
  }
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("categoryFilter").addEventListener("change", (e) => {
  filterByCategory(e.target.value);
});

// Initialize app
loadQuotes();
createAddQuoteForm();
fetchQuotesFromServer();

// Restore last shown quote from session storage
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
