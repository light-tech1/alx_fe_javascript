let quotes = [];

// === Initialize the app ===
document.addEventListener("DOMContentLoaded", () => {
  loadQuotesFromLocalStorage();
  populateCategories();
  displayQuotes();
  createAddQuoteForm();
  startSyncing(); // Begin periodic server sync
});

// === Create Quote Form ===
function createAddQuoteForm() {
  const form = document.getElementById("addQuoteForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addQuote();
  });
}

// === Add Quote ===
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (!text || !author || !category) return;

  const newQuote = {
    text,
    author,
    category,
    id: Date.now(),
  };

  quotes.push(newQuote);
  saveQuotesToLocalStorage();
  populateCategories();
  displayQuotes();

  document.getElementById("addQuoteForm").reset();
}

// === Display Quotes ===
function displayQuotes(filteredQuotes = quotes) {
  const container = document.getElementById("quoteList");
  container.innerHTML = "";

  filteredQuotes.forEach((q) => {
    const div = document.createElement("div");
    div.className = "quote-card";
    div.innerHTML = `
      <p>"${q.text}"</p>
      <p><strong>- ${q.author}</strong></p>
      <p class="quote-category">Category: ${q.category}</p>
    `;
    container.appendChild(div);
  });
}

// === Local Storage Functions ===
function saveQuotesToLocalStorage() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) quotes = JSON.parse(storedQuotes);
}

// === Category Filtering ===
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];
  select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  if (selected === "all") displayQuotes();
  else displayQuotes(quotes.filter((q) => q.category === selected));
  localStorage.setItem("lastSelectedCategory", selected);
}

// === Simulated Server Sync ===
async function fetchQuotesFromServer() {
  // Simulate fetching from server
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
  const data = await res.json();

  // Convert mock data to quote format
  return data.map(item => ({
    id: item.id,
    text: item.title,
    author: "Server Author",
    category: "Server",
  }));
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: Server data takes precedence
  const merged = [...serverQuotes, ...quotes.filter(
    q => !serverQuotes.some(sq => sq.id === q.id)
  )];

  quotes = merged;
  saveQuotesToLocalStorage();
  populateCategories();
  displayQuotes();
  showNotification("✅ Quotes synced with server!");
}

// === Notification ===
function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => (note.textContent = ""), 3000);
}

// === Periodic Syncing ===
function startSyncing() {
  syncQuotes();
  setInterval(syncQuotes, 15000); // Sync every 15 seconds
}
