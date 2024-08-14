document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const summary = document.getElementById('summary');
    const filterCategory = document.getElementById('filter-category');
    const filterButton = document.getElementById('filter-button');
    const clearButton = document.getElementById('clear-button');

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    function renderExpenses(expensesToRender) {
        expenseList.innerHTML = '';
        let total = 0;
        expensesToRender.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.innerHTML = `
                <strong>${expense.description}</strong> - $${expense.amount} (${expense.category})
            `;
            expenseList.appendChild(expenseItem);
            total += parseFloat(expense.amount);
        });
        summary.textContent = `Total Expenses: $${total.toFixed(2)}`;
    }

    function addExpense(expense) {
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses(expenses);
    }

    function filterExpenses() {
        const category = filterCategory.value.toLowerCase();

        const filteredExpenses = expenses.filter(expense => {
            return (!category || expense.category.toLowerCase().includes(category));
        });

        renderExpenses(filteredExpenses);
    }

    function clearExpenses() {
        expenses = [];
        localStorage.removeItem('expenses');
        renderExpenses(expenses);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;

        addExpense({ description, amount, category });
        form.reset();
    });

    filterButton.addEventListener('click', filterExpenses);
    clearButton.addEventListener('click', clearExpenses);

    renderExpenses(expenses);
});
