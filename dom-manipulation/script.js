let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do one thing every day that scares you.", category: "Courage" },
  { text: "Happiness depends upon ourselves.", category: "Philosophy" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available. Please add one!</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote>"${text}"</blockquote>
    <p><em>Category: ${category}</em></p>
  `;
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes(); 

  textInput.value = "";
  categoryInput.value = "";

  quoteDisplay.innerHTML = `
    <blockquote>"${text}"</blockquote>
    <p><em>Category: ${category}</em></p>
  `;

  alert("New quote added successfully!");
}

function createAddQuoteForm() {
  const form = document.createElement("form");
  form.id = "addQuoteForm";
  form.innerHTML = `
    <h2>Add a New Quote</h2>
    <label>Quote:</label><br>
    <textarea id="quoteText" rows="3" cols="40" placeholder="Enter quote text" required></textarea><br><br>
    <label>Category:</label><br>
    <input type="text" id="quoteCategory" placeholder="Enter quote category" required><br><br>
    <button type="submit">Add Quote</button>
  `;

  document.body.appendChild(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const text = document.getElementById("quoteText").value.trim();
    const category = document.getElementById("quoteCategory").value.trim();

    if (text && category) {
      quotes.push({ text, category });
      saveQuotes(); 
      alert("New quote added via form!");
      form.reset();
      showRandomQuote();
    } else {
      alert("Please fill in both fields.");
    }
  });
}

newQuoteBtn.addEventListener("click", showRandomQuote);

showRandomQuote();
createAddQuoteForm();
