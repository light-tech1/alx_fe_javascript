let quotes = [];

// Load quotes from Local Storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes if none exist
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" }
    ];
  }
}

// Save quotes to Local Storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
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

  // Save last viewed quote to Session Storage
  sessionStorage.setItem("lastQuote", JSON.stringify({ text, category }));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  alert("Quote added successfully!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  showRandomQuote();
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
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
        alert("Quotes imported successfully!");
        showRandomQuote();
      } else {
        alert("Invalid JSON format!");
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

// Show last viewed quote if available
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
