// -----------------------------
// Dynamic Quote Generator with Server Sync
// -----------------------------

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
];

const app = document.getElementById("quoteApp");

// -----------------------------
// INITIALIZE
// -----------------------------
function init() {
  createAddQuoteForm();
  populateCategories();
  displayQuotes(quotes);

  // Load saved filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) document.getElementById("categoryFilter").value = savedFilter;

  // Initial sync
  syncQuotes();

  // Auto-sync every 30 seconds
  setInterval(syncQuotes, 30000);
}

// -----------------------------
// CREATE FORM + FILTER
// -----------------------------
function createAddQuoteForm() {
  app.innerHTML = `
    <h2>Dynamic Quote Generator</h2>
    <form onsubmit="addQuote(event)">
      <input type="text" id="newQuoteText" placeholder="Enter a new quote" required />
      <input type="text" id="newQuoteCategory" placeholder="Enter category" required />
      <button type="submit">Add Quote</button>
    </form>

    <div style="margin-top:10px;">
      <select id="categoryFilter" onchange="filterQuotes()">
        <option value="all">All Categories</option>
      </select>
      <button onclick="syncQuotes()">🔄 Sync Now</button>
    </div>

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
    div.style.margin = "10px 0";
    div.style.padding = "10px";
    div.style.border = "1px solid #ddd";
    div.style.borderRadius = "5px";
    div.style.background = "#fafafa";
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

  syncQuotes(); // sync immediately after adding
}

// -----------------------------
// POPULATE CATEGORIES
// -----------------------------
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;
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
// SERVER SYNC SYSTEM
// -----------------------------
async function syncQuotes() {
  updateStatus("🔁 Syncing with server...");

  try {
    await syncWithServer();       // Upload local quotes
    await fetchQuotesFromServer(); // Fetch and merge server data
    updateStatus("✅ Sync complete!");
  } catch (error) {
    updateStatus("⚠️ Sync failed: " + error.message);
  }
}

// -----------------------------
// FETCH FROM SERVER (GET)
// -----------------------------
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();

  // Simulate received server quotes
  const serverQuotes = data.slice(0, 3).map(post => ({
    text: post.title,
    category: "Server"
  }));

  // Conflict resolution: server wins
  const combined = [...serverQuotes, ...quotes];
  quotes = Array.from(new Map(combined.map(q => [q.text, q])).values());

  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  filterQuotes();
}

// -----------------------------
// SEND TO SERVER (POST)
// -----------------------------
async function syncWithServer() {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quotes)
  });
}

// -----------------------------
// STATUS MESSAGES
// -----------------------------
function updateStatus(message) {
  const status = document.getElementById("syncStatus");
  status.textContent = message;
  status.style.color = message.includes("✅")
    ? "green"
    : message.includes("⚠️")
    ? "orange"
    : "blue";
}

// -----------------------------
window.onload = init;
