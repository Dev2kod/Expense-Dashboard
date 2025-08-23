// ---- Theme handling with persistence + particles mode ----
const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const THEME_KEY = "et-theme";

function applyTheme(mode){
    if(mode === "dark"){
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        themeToggle.checked = true;
        initParticles("dark");
    }else{
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        themeToggle.checked = false;
        initParticles("light");
    }
    localStorage.setItem(THEME_KEY, mode);
}

(function initTheme(){
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
})();

themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "dark" : "light");
});

// ---- Particles config (subtle, mode-aware) ----
function initParticles(mode){
    if(!window.particlesJS) return;
    const dark = mode === "dark";
    particlesJS("particles-js", {
        particles:{
            number:{ value: 80, density:{ enable:true, value_area: 1000 } }, // tweaked
            color:{ value: dark ? "#9aa0ff" : "#7a88ff" },
            shape:{
                type:"circle",
                stroke:{ width: 0, color: '#000000' },
                polygon:{ nb_sides: 5 }
            },
            opacity:{
                value: 0.25,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size:{
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.5,
                    sync: false
                }
            },
            line_linked:{ enable: false },
            move:{
                enable:true,
                speed:2.5, // was 1.5 → more lively
                direction:"none",
                random:true,
                straight:false,
                out_mode:"out",
                bounce:false,
                attract:{ enable:false, rotateX:600, rotateY:1200 }
            }
        },
        interactivity:{
            detect_on:"canvas",
            events:{
                onhover:{ enable:true, mode:"repulse" },
                onclick:{ enable:false },
                resize:true
            },
            modes:{
                repulse:{ distance: 100, duration: 0.4 }
            }
        },
        retina_detect:true
    });
}

// ---- App state ----
let expenses = JSON.parse(localStorage.getItem("et-expenses") || "[]");

// ---- Elements ----
const expenseForm = document.getElementById("expense-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseList = document.getElementById("expense-list");
const summary = document.getElementById("summary");
const filterInput = document.getElementById("filter-category");
const sortAmountBtn = document.getElementById("sort-amount");
const sortCategoryBtn = document.getElementById("sort-category");
const clearBtn = document.getElementById("clear-button");
const container = document.querySelector(".container");

// ---- Helpers ----
function save(){ localStorage.setItem("et-expenses", JSON.stringify(expenses)); }
function currency(n){ return "₹" + Number(n).toFixed(2); } // change to $ if you prefer

// ---- Ripple micro-interaction ----
function ripple(e){
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.left = (e.clientX - rect.left) + "px";
    span.style.top  = (e.clientY - rect.top)  + "px";
    btn.appendChild(span);
    setTimeout(()=>span.remove(), 600);
}

// Attach ripple to all buttons (delegated after DOM ready)
function attachRipples(){
    document.querySelectorAll("button").forEach(b => {
        b.removeEventListener("click", ripple);
        b.addEventListener("click", ripple);
    });
}

// ---- Render ----
function render(list = expenses){
    expenseList.innerHTML = "";
    list.forEach(exp => {
        const item = document.createElement("div");
        item.className = "expense-item";
        item.innerHTML = `
            <div class="details">
                <strong>${escapeHTML(exp.description)}</strong>
                <span>${escapeHTML(exp.category)}</span>
            </div>
            <div class="amount">${currency(exp.amount)}</div>
            <div class="actions">
                <button class="edit-btn" aria-label="Edit">✏️</button>
                <button class="delete-btn" aria-label="Delete">🗑️</button>
            </div>
        `;

        // Delete
        item.querySelector(".delete-btn").addEventListener("click", () => {
            expenses = expenses.filter(e => e.id !== exp.id);
            save(); render(); updateSummary();
        });

        // Edit (prefill then remove old record)
        item.querySelector(".edit-btn").addEventListener("click", () => {
            descriptionInput.value = exp.description;
            amountInput.value = exp.amount;
            categoryInput.value = exp.category;
            expenses = expenses.filter(e => e.id !== exp.id);
            save(); render(); updateSummary();
        });

        expenseList.appendChild(item);
    });

    attachRipples();
    updateSummary();
}

// ---- Summary: auto-hide if empty ----
function updateSummary(){
    if(expenses.length === 0){
        summary.classList.add("is-empty");
        summary.textContent = "";
        return;
    }
    const total = expenses.reduce((s,e)=> s + Number(e.amount||0), 0);
    summary.classList.remove("is-empty");
    summary.textContent = `Total Spent: ${currency(total)}`;
}

// ---- Add ----
expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const desc = descriptionInput.value.trim();
    const amt  = parseFloat(amountInput.value);
    const cat  = categoryInput.value;

    if(!desc || !cat || isNaN(amt) || amt <= 0) return;

    expenses.push({ id: Date.now(), description: desc, amount: amt, category: cat });
    save(); render();
    expenseForm.reset();
    descriptionInput.focus();
});

// ---- Filter ----
filterInput.addEventListener("input", () => {
    const q = filterInput.value.trim().toLowerCase();
    const filtered = expenses.filter(e => e.category.toLowerCase().includes(q));
    render(filtered);
});

// ---- Sort ----
sortAmountBtn.addEventListener("click", () => {
    expenses.sort((a,b) => a.amount - b.amount);
    save(); render();
});
sortCategoryBtn.addEventListener("click", () => {
    expenses.sort((a,b) => a.category.localeCompare(b.category));
    save(); render();
});

// ---- Clear ----
clearBtn.addEventListener("click", () => {
    if(!confirm("Clear all expenses?")) return;
    expenses = []; save(); render();
});

// ---- XSS-safe text ----
function escapeHTML(str){
    return String(str).replace(/[&<>"']/g, s => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[s]));
}

// ---- Kickoff ----
document.addEventListener("DOMContentLoaded", () => {
    // Show the container after a slight delay to allow the intro animation to play
    setTimeout(() => {
        container.classList.add("visible");
    }, 2000); // Matches the end of the intro-overlay fadeOut animation
    render();
    attachRipples();
});
