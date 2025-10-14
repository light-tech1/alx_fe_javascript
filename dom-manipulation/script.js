// Step 1: Array of quote objects (each with text and category)
const quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Motivation" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Wisdom" }
];

// Step 2: Reference DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// Step 3: Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Please add one below.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <p><em>Category: ${quote.category}</em></p>
  `;
}

// Step 4: Function to dynamically create the Add Quote form
function createAddQuoteForm() {
  // Create a container div
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.style.marginTop = "20px";

  // Create input for quote text
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  // Create input for category
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  // Create add button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  // Append elements to the container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // Append the form to the body
  document.body.appendChild(formContainer);
}

// Step 5: Function to add a new quote to the array dynamically
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please fill in both fields before adding a quote.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  alert("New quote added successfully!");

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Step 6: Event listener to show random quote
newQuoteButton.addEventListener("click", showRandomQuote);

// Step 7: Initialize form dynamically on page load
createAddQuoteForm();
