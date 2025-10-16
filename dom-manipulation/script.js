// ============================
// Dynamic Quote Generator with Sync
// ============================

// Local data (initial quotes)
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe in yourself.", author: "Unknown", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" }
];

// ---- Create Add Quote Form ----
function createAddQuoteForm() {
  const container = document.getElementById("quoteApp");
  container.innerHTML = `
    <h2>Dynamic Quote Generator</h2>

    <form id="addQuoteForm">
      <input type="text" id="quoteText" placeholder="Enter quote" required>
      <input type="text" id="quoteAuthor" placeholder="Author" required>
      <input type="text" id="quoteCategory" placeholder="Category" required>
      <button type="submit">Add Quote</button>
    </form>

    <select id="categoryFilter" onchange="filterQuotes()">
      <option value="all">All Categories</option>
    </select>

    <div id="quoteList"></div>

    <div id="syncStatus" style="margin-top:10px; color:green;"></div>
  `;

  document.getElementById("addQuoteForm").addEventListener("submit", addQuote);
  populateCategories();
  displayQuotes();
  fetchQuotesFromServer(); // Fetch from server on load
  setInterval(fetchQuotesFromServer, 10000); // Periodic sync every 10s
}

// ---- Add Quote ----
function addQuote(e) {
  e.preventDefault();
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && author && category) {
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    displayQuotes();
    document.getElementById("addQuoteForm").reset();
    showSyncMessage("Quote added locally.");
  }
}

// ---- Populate Categories ----
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

// ---- Filter Quotes ----
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", selected);
  displayQuotes(selected);
}

// ---- Display Quotes ----
function displayQuotes(filter = localStorage.getItem("lastCategory") || "all") {
  const quoteList = document.getElementById("quoteList");
  const filtered = filter === "all" ? quotes : quotes.filter(q => q.category === filter);
  quoteList.innerHTML = filtered.length
    ? filtered.map(q => `<p><b>${q.text}</b> - ${q.author} <em>(${q.category})</em></p>`).join("")
    : "<p>No quotes available.</p>";

  document.getElementById("categoryFilter").value = filter;
}

// ---- Simulate Fetch from Server ----
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    const serverData = await response.json();

    // Convert fetched posts into fake quotes
    const serverQuotes = serverData.map(item => ({
      text: item.title,
      author: "Server Author",
      category: "Server"
    }));

    // Simple conflict resolution: server data overrides duplicates
    const combined = [...quotes];
    serverQuotes.forEach(sq => {
      if (!combined.some(q => q.text === sq.text)) combined.push(sq);
    });

    quotes = combined;
    localStorage.setItem("quotes", JSON.stringify(quotes));
    displayQuotes();
    populateCategories();
    showSyncMessage("Synced with server successfully!");
  } catch (err) {
    showSyncMessage("Failed to sync with server.", true);
  }
}

// ---- Show Sync Message ----
function showSyncMessage(msg, isError = false) {
  const el = document.getElementById("syncStatus");
  el.style.color = isError ? "red" : "green";
  el.textContent = msg;
  setTimeout(() => (el.textContent = ""), 4000);
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", createAddQuoteForm);
