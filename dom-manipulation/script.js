// -----------------------------
// Simulated Dynamic Quote App
// -----------------------------

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
];

// DOM elements
const app = document.getElementById("quoteApp");

// -----------------------------
// INITIALIZE APP
// -----------------------------
function init() {
  createAddQuoteForm();
  populateCategories();
  displayQuotes(quotes);
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, 30000); // auto-sync every 30s
}

// -----------------------------
// CREATE ADD QUOTE FORM + FILTER
// -----------------------------
function createAddQuoteForm() {
  app.innerHTML = `
    <h2>Dynamic Quote Generator</h2>
    <form onsubmit="addQuote(event)">
      <input type="text" id="newQuoteText" placeholder="Enter a new quote" required />
      <input type="text" id="newQuoteCategory" placeholder="Enter category" required />
      <button type="submit">Add Quote</button>
    </form>

    <select id="categoryFilter" onchange="filterQuotes()">
      <option value="all">All Categories</option>
    </select>

    <div id="quoteList"></div>
    <div id="syncStatus"></div>
  `;
}

// -----------------------------
// DISPLAY QUOTES
// -----------------------------
function displayQuotes(filteredQuotes) {
  const quoteList = document.getElementById("quoteList");
  quoteList.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteList.innerHTML = "<p>No quotes available.</p>";
    return;
  }

  filteredQuotes.forEach(q => {
    const div = document.createElement("div");
    div.className = "quote-card";
    div.innerHTML = `<strong>${q.text}</strong><br><em>${q.category}</em>`;
    quoteList.appendChild(div);
  });
}

// -----------------------------
// ADD QUOTE
// -----------------------------
function addQuote(e) {
  e.preventDefault();
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please fill out both fields.");

  quotes.push({ text, category });
  localStorage.setItem("quotes", JSON.stringify(quotes));

  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  syncWithServer();
}

// -----------------------------
// POPULATE CATEGORIES
// -----------------------------
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const filter = document.getElementById("categoryFilter");
  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
}

// -----------------------------
// FILTER QUOTES
// -----------------------------
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  if (selected === "all") {
    displayQuotes(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selected);
    displayQuotes(filtered);
  }
}

// -----------------------------
// SIMULATE FETCHING FROM SERVER
// -----------------------------
async function fetchQuotesFromServer() {
  try {
    updateStatus("Fetching latest quotes from server...");

    // simulate server fetch
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // simulate server quotes
    const serverQuotes = data.slice(0, 3).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution (server wins)
    quotes = [...serverQuotes, ...quotes];
    localStorage.setItem("quotes", JSON.stringify(quotes));

    populateCategories();
    filterQuotes();
    updateStatus("✅ Quotes synced with server.");
  } catch (error) {
    updateStatus("❌ Failed to sync with server.");
  }
}

// -----------------------------
// SIMULATE POSTING TO SERVER
// -----------------------------
async function syncWithServer() {
  try {
    updateStatus("Uploading quotes to server...");

    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });

    updateStatus("✅ Local quotes synced successfully.");
  } catch (error) {
    updateStatus("⚠️ Sync failed. Will retry later.");
  }
}

// -----------------------------
// STATUS UPDATES
// -----------------------------
function updateStatus(message) {
  const status = document.getElementById("syncStatus");
  status.textContent = message;
  status.style.color = message.includes("✅") ? "green" : message.includes("❌") ? "red" : "orange";
}

// -----------------------------
window.onload = init;
