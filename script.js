document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const summary = document.getElementById('summary');
    const filterCategory = document.getElementById('filter-category');
    const clearButton = document.getElementById('clear-button');
    const sortAmountButton = document.getElementById('sort-amount');
    const sortCategoryButton = document.getElementById('sort-category');
    const themeToggle = document.getElementById('theme-toggle');
    const submitButton = document.getElementById('submit-button');
    
    // --- State Management ---
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let editIndex = -1; // -1 indicates no item is being edited

    // --- Core Functions ---

    /**
     * Renders expenses to the DOM.
     * @param {Array} expensesToRender - The array of expenses to display.
     */
    function renderExpenses(expensesToRender = expenses) {
        expenseList.innerHTML = '';
        let total = 0;

        if (expensesToRender.length === 0) {
            expenseList.innerHTML = '<p style="text-align:center;">No expenses yet. Add one to get started!</p>';
        }

        expensesToRender.forEach((expense, index) => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            // Add a class if the item is being edited
            if (index === editIndex) {
                expenseItem.classList.add('editing');
            }

            expenseItem.innerHTML = `
                <div class="details">
                    <strong>${expense.description}</strong>
                    <span>${expense.category}</span>
                </div>
                <div class="amount">$${parseFloat(expense.amount).toFixed(2)}</div>
                <div class="actions">
                    <button class="edit-btn" onclick="handleEdit(${index})">✎</button>
                    <button class="delete-btn" onclick="deleteExpense(${index})">🗑️</button>
                </div>
            `;
            expenseList.appendChild(expenseItem);
            total += parseFloat(expense.amount);
        });

        summary.textContent = `Total Expenses: $${total.toFixed(2)}`;
    }

    /**
     * Saves expenses to localStorage.
     */
    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    /**
     * Adds a new expense or updates an existing one.
     * @param {Object} expense - The expense object.
     */
    function addOrUpdateExpense(expense) {
        const amount = parseFloat(expense.amount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid positive amount.");
            return;
        }

        if (editIndex === -1) { // Adding a new expense
            expenses.push(expense);
        } else { // Updating an existing expense
            expenses[editIndex] = expense;
            editIndex = -1; // Reset edit state
            submitButton.textContent = 'Add Expense';
        }
        
        saveExpenses();
        renderExpenses();
        highlightNewItem();
        expenseForm.reset();
    }

    /**
     * Sets up the form to edit an expense.
     * @param {number} index - The index of the expense to edit.
     */
    window.handleEdit = (index) => {
        editIndex = index;
        const expense = expenses[index];
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        submitButton.textContent = 'Update Expense';
        document.getElementById('description').focus();
        renderExpenses(); // Re-render to highlight the editing item
    };

    /**
     * Deletes an expense.
     * @param {number} index - The index of the expense to delete.
     */
    window.deleteExpense = (index) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            expenses.splice(index, 1);
            saveExpenses();
            renderExpenses();
        }
    };

    /**
     * Filters expenses by category.
     */
    function filterExpenses() {
        const category = filterCategory.value.toLowerCase().trim();
        const filteredExpenses = expenses.filter(expense =>
            expense.category.toLowerCase().includes(category)
        );
        renderExpenses(filteredExpenses);
    }

    /**
     * Clears all expenses from the list.
     */
    function clearAllExpenses() {
        if (confirm("Are you sure you want to clear ALL expenses? This cannot be undone.")) {
            expenses = [];
            saveExpenses();
            renderExpenses();
        }
    }
    
    /**
     * Sorts expenses by a given key ('amount' or 'category').
     * @param {string} by - The key to sort by.
     */
    function sortExpenses(by) {
        if (by === 'amount') {
            expenses.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        } else if (by === 'category') {
            expenses.sort((a, b) => a.category.localeCompare(b.category));
        }
        renderExpenses();
    }

    // --- UI/UX Enhancements ---

    function highlightNewItem() {
        if (expenseList.lastElementChild) {
            expenseList.lastElementChild.classList.add('highlight-new');
            expenseList.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
            setTimeout(() => {
                expenseList.lastElementChild.classList.remove('highlight-new');
            }, 1500);
        }
    }

    // --- Theme Management ---

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            themeToggle.checked = false;
        }
        // Re-initialize particles for the new theme
        initParticles(theme);
    }

    function toggleTheme() {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }
    
    // --- Particle.js Initialization ---
    
    function initParticles(theme) {
        const particleColor = theme === 'dark' ? '#8A2BE2' : '#4a90e2';
        const linkColor = theme === 'dark' ? '#3a3a5a' : '#c0c0c0';

        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": particleColor },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": linkColor, "opacity": 0.4, "width": 1 },
                "move": { "enable": true, "speed": 4, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }

    // --- Event Listeners ---

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value.trim();
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        if (!description || !amount || !category) return;
        
        addOrUpdateExpense({ description, amount, category });
    });

    filterCategory.addEventListener('input', filterExpenses);
    clearButton.addEventListener('click', clearAllExpenses);
    sortAmountButton.addEventListener('click', () => sortExpenses('amount'));
    sortCategoryButton.addEventListener('click', () => sortExpenses('category'));
    themeToggle.addEventListener('change', toggleTheme);
    
    // --- Initial Load ---

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    renderExpenses();
});