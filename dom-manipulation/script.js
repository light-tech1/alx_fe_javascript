let quotes = [];

// ----------------- Existing app functions (unchanged, but included) -----------------

// Load quotes from localStorage or use defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to stop talking and start doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Do one thing every day that scares you.", category: "Inspiration" },
      { text: "Success is not final; failure is not fatal: it is the courage to continue that counts.", category: "Perseverance" },
      { text: "Happiness depends upon ourselves.", category: "Wisdom" }
    ];
  }

  populateCategories();
  displayQuotes();
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Dynamically build the Add Quote form
function createAddQuoteForm() {
  const container = document.getElementById("addQuoteSection");

  container.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// Populate the category dropdown dynamically
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

// Display quotes on the page
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

// Filter quotes based on the selected category
function filterByCategory(category) {
  localStorage.setItem("selectedCategory", category);

  if (category === "All") {
    displayQuotes(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === category);
    displayQuotes(filtered);
  }
}

// ✅ Wrapper for test compatibility (same as filterByCategory)
function filterQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  filterByCategory(selectedCategory);
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
    alert("Please enter both a quote and its category.");
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

// ----------------- New: Sync & Conflict Handling -----------------

// Simulated server fallback (English quotes)
const simulatedServerQuotes = [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" },
  { text: "Dream big and dare to fail.", category: "Courage" }
];

// Keeps latest conflict batch for manual review
let lastSyncSummary = { added: [], updated: [], conflicts: [] };

// Try to fetch real server quotes, fall back to simulatedServerQuotes
async function fetchQuotesFromServer() {
  // Attempt to fetch from a (mock) endpoint. If the fetch fails, fallback to simulated server quotes.
  const endpoint = "/api/quotes"; // placeholder — real app would replace this
  let serverQuotes = [];

  try {
    const resp = await fetch(endpoint, { cache: "no-store" });
    if (resp.ok) {
      const data = await resp.json();
      // Expect data as array of {text, category} — but we verify and normalize.
      serverQuotes = Array.isArray(data) ? data.filter(d => d && d.text) : [];
    } else {
      // fallback
      serverQuotes = simulatedServerQuotes;
    }
  } catch (err) {
    // network or CORS; fallback to simulation
    serverQuotes = simulatedServerQuotes;
  }

  // Normalize server quotes (ensure English text present and trim)
  serverQuotes = serverQuotes.map(s => ({ text: String(s.text).trim(), category: String(s.category || "General").trim() }));

  // Perform merge with server-wins conflict resolution
  const result = mergeWithServer(serverQuotes);
  lastSyncSummary = result; // keep summary for manual review UI

  saveQuotes();
  populateCategories();

  // Update visible list according to current filter
  const currentFilter = document.getElementById("categoryFilter") ? document.getElementById("categoryFilter").value : "All";
  filterByCategory(currentFilter);

  // Show sync banner with summary
  showSyncBanner(result);
  return result;
}

/*
 mergeWithServer(serverQuotes)
 - serverQuotes: array from server
 - strategy: server wins on conflicts. We'll detect:
    * added: quotes present on server but not locally (by text)
    * updated: quotes where text matches but category differs (server replaces local)
    * conflicts: details of replacements (kept for manual review)
 - local-only quotes remain (no deletion unless server explicitly indicates deletion — not implemented here)
*/
function mergeWithServer(serverQuotes) {
  const added = [];
  const updated = [];
  const conflicts = [];

  // Create a map for quick lookup by normalized text
  const localByText = new Map(quotes.map(q => [q.text.trim(), q]));
  const serverByText = new Map(serverQuotes.map(s => [s.text.trim(), s]));

  // 1) Add server-only quotes
  for (const [text, sQuote] of serverByText.entries()) {
    if (!localByText.has(text)) {
      quotes.push({ text: sQuote.text, category: sQuote.category });
      added.push(sQuote);
    } else {
      const local = localByText.get(text);
      // If categories differ, server wins: update local
      if ((local.category || "") !== (sQuote.category || "")) {
        const before = { ...local };
        local.category = sQuote.category;
        updated.push({ before, after: { ...local } });
        conflicts.push({ localBefore: before, server: sQuote });
      }
    }
  }

  // Note: we do not delete local-only quotes because that could be destructive;
  // real servers might indicate deletions explicitly. This keeps local-only data.
  return { added, updated, conflicts };
}

// Show a small banner summarizing the sync, with a Review button for conflicts
function showSyncBanner(summary) {
  // Create or update banner
  let banner = document.getElementById("syncBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "syncBanner";
    banner.style.position = "fixed";
    banner.style.right = "16px";
    banner.style.bottom = "16px";
    banner.style.background = "#fffbe6";
    banner.style.border = "1px solid #ffd24d";
    banner.style.padding = "12px";
    banner.style.borderRadius = "8px";
    banner.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
    banner.style.zIndex = "9999";
    document.body.appendChild(banner);
  }

  const addedCount = summary.added.length;
  const updatedCount = summary.updated.length;
  const conflictsCount = summary.conflicts.length;

  banner.innerHTML = `
    <div style="font-size:14px; margin-bottom:6px;">
      <strong>Sync complete</strong> — added: ${addedCount}, updated: ${updatedCount}, conflicts: ${conflictsCount}
    </div>
    <div style="text-align:right;">
      ${conflictsCount > 0 ? `<button id="reviewConflictsBtn">Review changes</button>` : ""}
      <button id="dismissSyncBtn">Dismiss</button>
    </div>
  `;

  // Attach handlers
  if (conflictsCount > 0) {
    document.getElementById("reviewConflictsBtn").addEventListener("click", openConflictModal);
  }
  document.getElementById("dismissSyncBtn").addEventListener("click", () => {
    banner.remove();
  });
}

// Build and open a modal to review conflicts and let user choose Local or Server for each
function openConflictModal() {
  const summary = lastSyncSummary;
  if (!summary || summary.conflicts.length === 0) {
    alert("No conflicts to review.");
    return;
  }

  // Modal backdrop
  let backdrop = document.getElementById("conflictBackdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "conflictBackdrop";
    backdrop.style.position = "fixed";
    backdrop.style.left = "0";
    backdrop.style.top = "0";
    backdrop.style.width = "100%";
    backdrop.style.height = "100%";
    backdrop.style.background = "rgba(0,0,0,0.4)";
    backdrop.style.display = "flex";
    backdrop.style.alignItems = "center";
    backdrop.style.justifyContent = "center";
    backdrop.style.zIndex = "10000";
    document.body.appendChild(backdrop);
  }
  backdrop.innerHTML = "";

  // Modal container
  const modal = document.createElement("div");
  modal.style.width = "90%";
  modal.style.maxWidth = "700px";
  modal.style.maxHeight = "80%";
  modal.style.overflow = "auto";
  modal.style.background = "#fff";
  modal.style.borderRadius = "8px";
  modal.style.padding = "16px";
  backdrop.appendChild(modal);

  modal.innerHTML = `
    <h3 style="margin-top:0;">Review Sync Conflicts</h3>
    <p style="color:#555;">Server changes were applied automatically (server wins). You can manually choose to keep Local or Server for each item below.</p>
    <div id="conflictList"></div>
    <div style="text-align:right; margin-top:12px;">
      <button id="closeConflictModal">Close</button>
    </div>
  `;

  const conflictList = modal.querySelector("#conflictList");

  summary.conflicts.forEach((c, idx) => {
    const item = document.createElement("div");
    item.style.borderTop = "1px solid #eee";
    item.style.padding = "10px 0";

    item.innerHTML = `
      <div><strong>Quote:</strong> "${c.localBefore.text}"</div>
      <div style="margin-top:6px;">
        <label><input type="radio" name="choice${idx}" value="server" checked> Keep <strong>Server</strong> (current)</label>
        &nbsp;&nbsp;
        <label><input type="radio" name="choice${idx}" value="local"> Keep <strong>Local</strong></label>
      </div>
      <div style="margin-top:8px; font-size:13px; color:#333;">
        <div><em>Local category:</em> ${c.localBefore.category}</div>
        <div><em>Server category:</em> ${c.server.category}</div>
      </div>
    `;

    conflictList.appendChild(item);
  });

  // Handler for Close (apply selections)
  document.getElementById("closeConflictModal").addEventListener("click", () => {
    // Apply user choices
    const choices = [];
    summary.conflicts.forEach((c, idx) => {
      const radios = modal.querySelectorAll(`input[name="choice${idx}"]`);
      let picked = "server";
      radios.forEach(r => {
        if (r.checked) picked = r.value;
      });
      choices.push({ conflict: c, pick: picked });
    });

    // Apply picks: if user picks 'local' we restore the localBefore state; if 'server' we keep server (already applied)
    choices.forEach(ch => {
      if (ch.pick === "local") {
        // find local quote by text and set its category back to localBefore.category
        const loc = quotes.find(q => q.text === ch.conflict.localBefore.text);
        if (loc) {
          loc.category = ch.conflict.localBefore.category;
        } else {
          // if local was replaced (unlikely), re-add the localBefore
          quotes.push({ text: ch.conflict.localBefore.text, category: ch.conflict.localBefore.category });
        }
      }
    });

    saveQuotes();
    populateCategories();
    filterByCategory(document.getElementById("categoryFilter").value);

    // Remove modal
    const b = document.getElementById("conflictBackdrop");
    if (b) b.remove();
    // Remove sync banner too
    const banner = document.getElementById("syncBanner");
    if (banner) banner.remove();

    alert("Conflict choices applied.");
  });
}

// Periodic sync: run fetchQuotesFromServer every 60 seconds
let syncIntervalId = null;
function startPeriodicSync(intervalMs = 60000) {
  if (syncIntervalId) clearInterval(syncIntervalId);
  syncIntervalId = setInterval(() => {
    fetchQuotesFromServer();
  }, intervalMs);
}

// Optionally allow manual trigger via a UI button (we'll add a small button)
function ensureSyncButton() {
  if (document.getElementById("syncWithServerBtn")) return;

  const btn = document.createElement("button");
  btn.id = "syncWithServerBtn";
  btn.textContent = "Sync with Server";
  btn.style.position = "fixed";
  btn.style.right = "16px";
  btn.style.bottom = "80px";
  btn.style.zIndex = "9999";
  btn.style.padding = "10px 12px";
  btn.style.borderRadius = "8px";
  btn.style.background = "#e8f0ff";
  btn.style.border = "1px solid #bcd1ff";
  btn.style.cursor = "pointer";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    fetchQuotesFromServer();
  });
}

// ----------------- Boot & event wiring -----------------

// Event listeners (existing)
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("categoryFilter").addEventListener("change", (e) => {
  filterByCategory(e.target.value);
});

// Initialize the app
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

fetchQuotesFromServer();  
startPeriodicSync(60000);  
ensureSyncButton();    