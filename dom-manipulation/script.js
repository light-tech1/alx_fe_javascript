let quotes = [];

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

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function createAddQuoteForm() {
  const container = document.getElementById("addQuoteSection");

  container.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

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

function filterByCategory(category) {
  localStorage.setItem("selectedCategory", category);

  if (category === "All") {
    displayQuotes(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === category);
    displayQuotes(filtered);
  }
}

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

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

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

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("categoryFilter").addEventListener("change", (e) => {
  filterByCategory(e.target.value);
});

loadQuotes();
createAddQuoteForm();

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
