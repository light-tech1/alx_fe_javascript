// ===========================
// INITIAL DATA SETUP
// ===========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// Simulated server quotes (our "mock database")
let serverQuotes = [
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "Life" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra", category: "Motivation" }
];

// ===========================
// CREATE ADD QUOTE FORM
// ===========================
function createAddQuoteForm() {
  const container = document.getElementById("quoteFormContainer");
  container.innerHTML = `
    <h3>Add a New Quote</h3>
    <input type="text" id="quoteText" placeholder="Enter quote text">
    <input type="text" id="quoteAuthor" placeholder="Enter author">
    <input type="text" id="quoteCategory" placeholder="Enter category">
    <button onclick="addQuote()">Add Quote</button>

    <br><br>
    <label><strong>Filter by Category:</strong></label>
    <select id="categoryFilter" onchange="filterQuotes()">
      <option value="all">All Categories</option>
    </select>
  `;
}

// ===========================
// DISPLAY QUOTES
// ===========================
function displayQuotes(list = quotes) {
  const container = document.getElementById("quoteContainer");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p>No quotes found.</p>";
    return;
  }

  list.forEach(q => {
    const div = document.createElement("div");
    div.classList.add("quote-card");
    div.innerHTML = `
      <p>"${q.text}"</p>
      <p><em>- ${q.author}</em></p>
      <p><small>Category: ${q.category}</small></p>
    `;
    container.appendChild(div);
  });
}

// ===========================
// POPULATE CATEGORY FILTER
// ===========================
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  filter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  // Restore last filter
  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter) {
    filter.value = lastFilter;
    filterQuotes();
  }
}

// ===========================
// FILTER QUOTES
// ===========================
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  if (selected === "all") displayQuotes(quotes);
  else displayQuotes(quotes.filter(q => q.category === selected));
}

// ===========================
// ADD NEW QUOTE
// ===========================
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (!text || !author || !category) {
    alert("Please fill in all fields");
    return;
  }

  const newQuote = { text, author, category };
  quotes.push(newQuote);
  saveQuotes();

  // Add new category if needed
  populateCategories();
  displayQuotes(quotes);

  // Reset fields
  document.getElementById("quoteText").value = "";
  document.getElementById("quoteAuthor").value = "";
  document.getElementById("quoteCategory").value = "";

  // Simulate sending to server
  sendToServer(newQuote);
}

// ===========================
// LOCAL STORAGE HANDLING
// ===========================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ===========================
// SIMULATED SERVER FUNCTIONS
// ===========================
function fetchFromServer() {
  return new Promise(resolve => {
    setTimeout(() => resolve(serverQuotes), 1000); // simulate 1s delay
  });
}

function sendToServer(quote) {
  return new Promise(resolve => {
    setTimeout(() => {
      serverQuotes.push(quote);
      resolve();
    }, 500);
  });
}

// ===========================
// CONFLICT RESOLUTION
// ===========================
function showNotice(message) {
  const notice = document.createElement("div");
  notice.classList.add("notice");
  notice.textContent = message;
  document.body.prepend(notice);
  setTimeout(() => notice.remove(), 4000);
}

async function syncWithServer() {
  const serverData = await fetchFromServer();
  const localData = JSON.parse(localStorage.getItem("quotes")) || [];

  // Compare: if they differ, server wins
  if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
    quotes = serverData;
    saveQuotes();
    displayQuotes(quotes);
    populateCategories();
    showNotice("⚠️ Data updated from server — conflicts resolved.");
  } else {
    showNotice("✅ Data already up-to-date.");
  }
}

// ===========================
// INIT
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  populateCategories();
  displayQuotes(quotes);
  syncWithServer(); // First sync
  setInterval(syncWithServer, 30000); // Auto sync every 30 seconds
});
