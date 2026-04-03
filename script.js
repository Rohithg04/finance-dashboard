// State representation
const state = {
  transactions: JSON.parse(localStorage.getItem("transactions")) || [
    { id: 1, date: "2026-04-01", amount: 5000, category: "Salary", type: "income" },
    { id: 2, date: "2026-04-02", amount: 1200, category: "Food", type: "expense" },
    { id: 3, date: "2026-04-03", amount: 800, category: "Transport", type: "expense" },
    { id: 4, date: "2026-04-05", amount: 3500, category: "Freelance", type: "income" },
    { id: 5, date: "2026-04-08", amount: 150, category: "Subscriptions", type: "expense" }
  ],
  role: "viewer", // 'viewer' | 'admin'
  theme: localStorage.getItem("theme") || "dark",
  isDataLoaded: false
};

// Chart instances
let lineChartInstance = null;
let pieChartInstance = null;

// DOM Elements
const DOM = {
  roleSelect: document.getElementById('role'),
  themeToggle: document.getElementById('toggleTheme'),
  exportBtn: document.getElementById('exportBtn'),
  addBtn: document.getElementById('addTxnBtn'),
  search: document.getElementById('search'),
  filter: document.getElementById('filter'),
  sort: document.getElementById('sort'),
  
  summary: document.getElementById('summary'),
  tableBody: document.getElementById('tableBody'),
  emptyState: document.getElementById('emptyState'),
  table: document.getElementById('table'),
  insights: document.getElementById('insights'),
  
  // Mobile Nav
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  closeSidebarBtn: document.getElementById('closeSidebar'),
  sidebar: document.getElementById('sidebar'),
  mobileOverlay: document.getElementById('mobileOverlay'),
  
  // Modal
  modalOverlay: document.getElementById('txnModal'),
  modalTitle: document.getElementById('modalTitle'),
  closeModal: document.getElementById('closeModal'),
  cancelModal: document.getElementById('cancelModalBtn'),
  txnForm: document.getElementById('txnForm'),
  
  // Form Inputs
  formId: document.getElementById('txnId'),
  formType: document.getElementById('type'),
  formAmount: document.getElementById('amount'),
  formCategory: document.getElementById('category'),
  formDate: document.getElementById('date'),

  // Toast
  toastContainer: document.getElementById('toast-container')
};

// Formatting helpers
const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (dateString) => {
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

/* ================= TOAST NOTIFICATIONS ================= */
function showToast(title, message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ph-info';
  if (type === 'success') icon = 'ph-check-circle';
  if (type === 'error') icon = 'ph-x-circle';

  toast.innerHTML = `
    <i class="ph-fill ${icon} toast-icon"></i>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      <span class="toast-msg">${message}</span>
    </div>
  `;
  
  DOM.toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400); // Wait for transition
  }, 3500);
}

/* ================= INIT & SKELETONS ================= */
function init() {
  document.body.className = `${state.theme === 'dark' ? 'dark-mode' : ''} ${state.role === 'admin' ? 'mode-admin' : ''}`.trim();
  DOM.roleSelect.value = state.role;
  
  attachEventListeners();
  
  // Render Skeletons First
  renderSkeletons();
  
  // Simulate network request
  setTimeout(() => {
    state.isDataLoaded = true;
    updateUI();
  }, 1200); // 1.2s realistic loading time
}

function renderSkeletons() {
  // Summary Skeletons
  DOM.summary.innerHTML = Array(3).fill(`
    <div class="summary-card card-box skeleton" style="height: 140px;"></div>
  `).join('');
  
  // Insights Skeleton
  DOM.insights.innerHTML = `
    <div class="skeleton" style="height: 80px; width: 100%; border-radius: 12px; margin-bottom: 16px;"></div>
    <div class="skeleton" style="height: 80px; width: 100%; border-radius: 12px;"></div>
  `;

  // Table Skeleton
  DOM.tableBody.innerHTML = Array(4).fill(`
    <tr>
      <td><div class="skeleton" style="width: 80px; height: 20px;"></div></td>
      <td><div class="skeleton" style="width: 150px; height: 20px;"></div></td>
      <td><div class="skeleton" style="width: 60px; height: 20px;"></div></td>
      <td><div class="skeleton" style="width: 90px; height: 20px;"></div></td>
      <td class="${state.role === 'admin' ? '' : 'hidden'}"><div class="skeleton" style="width: 40px; height: 20px;"></div></td>
    </tr>
  `).join('');
}

/* ================= EVENT LISTENERS ================= */
function attachEventListeners() {
  // Roles & Themes
  DOM.roleSelect.addEventListener('change', (e) => {
    state.role = e.target.value;
    updateUI();
    showToast("Role Updated", `You are now in ${state.role} mode.`, "info");
  });
  
  DOM.themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.className = `${state.theme === 'dark' ? 'dark-mode' : ''} ${state.role === 'admin' ? 'mode-admin' : ''}`.trim();
    localStorage.setItem("theme", state.theme);
    if (state.isDataLoaded) renderCharts();
  });

  // Mobile Nav
  const toggleMobileNav = () => {
    DOM.sidebar.classList.toggle('mobile-active');
    DOM.mobileOverlay.classList.toggle('active');
  };
  DOM.mobileMenuBtn.addEventListener('click', toggleMobileNav);
  DOM.closeSidebarBtn.addEventListener('click', toggleMobileNav);
  DOM.mobileOverlay.addEventListener('click', toggleMobileNav);
  
  // Filters & Search
  DOM.search.addEventListener('input', applyFilters);
  DOM.filter.addEventListener('change', applyFilters);
  DOM.sort.addEventListener('change', applyFilters);
  
  // Modals
  DOM.addBtn.addEventListener('click', () => openModal());
  DOM.closeModal.addEventListener('click', closeModal);
  DOM.cancelModal.addEventListener('click', closeModal);
  
  DOM.txnForm.addEventListener('submit', handleFormSubmit);
  DOM.exportBtn.addEventListener('click', exportToCSV);
}

/* ================= RENDER LOGIC ================= */
function updateUI() {
  if (!state.isDataLoaded) return;

  localStorage.setItem("transactions", JSON.stringify(state.transactions));
  
  // Admin logic & Theme Sync
  document.body.className = `${state.theme === 'dark' ? 'dark-mode' : ''} ${state.role === 'admin' ? 'mode-admin' : ''}`.trim();

  if (state.role === 'admin') {
    DOM.addBtn.classList.remove('hidden');
    document.querySelectorAll('.actions-col').forEach(el => el.classList.remove('hidden'));
  } else {
    DOM.addBtn.classList.add('hidden');
    document.querySelectorAll('.actions-col').forEach(el => el.classList.add('hidden'));
  }
  
  renderSummary();
  applyFilters(); 
  renderCharts();
  renderInsights();
}

function renderSummary() {
  let income = 0, expense = 0;
  
  state.transactions.forEach(t => {
    if (t.type === 'income') income += Number(t.amount);
    else expense += Number(t.amount);
  });
  
  const balance = income - expense;

  // Mocking Month-over-month growth for enterprise look
  const balanceGrowth = balance > 0 ? '+12.5%' : '-4.2%';
  const balanceGrowthClass = balance > 0 ? 'positive' : 'negative';

  const incomeGrowth = '+5.1%'; 
  const expenseGrowth = '-2.3%'; // less expense is good, but let's visually make it neutral/positive
  
  DOM.summary.innerHTML = `
    <div class="summary-card card-box balance">
      <div class="summary-header">
         <div class="icon-wrapper"><i class="ph-fill ph-wallet"></i></div>
         <span class="kpi-badge ${balanceGrowthClass}"><i class="ph-bold ${balance > 0 ? 'ph-trend-up' : 'ph-trend-down'}"></i> ${balanceGrowth}</span>
      </div>
      <h4>Total Balance</h4>
      <div class="value">${formatCurrency(balance)}</div>
    </div>

    <div class="summary-card card-box income">
      <div class="summary-header">
         <div class="icon-wrapper"><i class="ph-fill ph-check-circle"></i></div>
         <span class="kpi-badge positive"><i class="ph-bold ph-trend-up"></i> ${incomeGrowth}</span>
      </div>
      <h4>Total Income</h4>
      <div class="value">${formatCurrency(income)}</div>
    </div>

    <div class="summary-card card-box expense">
      <div class="summary-header">
         <div class="icon-wrapper"><i class="ph-fill ph-warning-circle"></i></div>
         <span class="kpi-badge neutral"><i class="ph-bold ph-trend-down"></i> ${expenseGrowth}</span>
      </div>
      <h4>Total Expense</h4>
      <div class="value">${formatCurrency(expense)}</div>
    </div>
  `;
}

function applyFilters() {
  if (!state.isDataLoaded) return;

  const searchTerm = DOM.search.value.toLowerCase();
  const filterType = DOM.filter.value;
  const sortBy = DOM.sort.value; 
  
  let filtered = state.transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(searchTerm) || String(t.amount).includes(searchTerm);
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });
  
  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });
  
  renderTable(filtered);
}

function renderTable(data) {
  DOM.tableBody.innerHTML = '';
  
  if (data.length === 0) {
    DOM.table.classList.add('hidden');
    DOM.emptyState.classList.remove('hidden');
    return;
  }
  
  DOM.table.classList.remove('hidden');
  DOM.emptyState.classList.add('hidden');
  
  // Calculate max amount for progress bars
  const maxAmount = Math.max(...state.transactions.map(t => t.amount), 1);
  
  data.forEach((t, i) => {
    const isIncome = t.type === 'income';
    const progressWidth = (t.amount / maxAmount) * 100;

    const tr = document.createElement('tr');
    tr.style.animationDelay = `${0.05 * i}s`; // Inline stagger override
    tr.className = 'animated stagger-1'; // Re-use animation

    tr.innerHTML = `
      <td style="white-space: nowrap;">${formatDate(t.date)}</td>
      <td>
        <div class="cat-progress-container">
           <span class="cat-name">${t.category}</span>
           <div class="cat-bar-bg hide-mobile">
              <div class="cat-bar-fill ${t.type}" style="width: ${progressWidth}%"></div>
           </div>
        </div>
      </td>
      <td><span class="badge ${t.type}">${t.type}</span></td>
      <td class="amount ${t.type}">${isIncome ? '+' : '-'}${formatCurrency(t.amount)}</td>
      <td class="actions-cell ${state.role === 'admin' ? '' : 'hidden'}">
         <button class="action-btn edit" onclick="openModal(${t.id})" title="Edit"><i class="ph ph-pencil-simple"></i></button>
         <button class="action-btn delete" onclick="deleteTxn(${t.id})" title="Delete"><i class="ph ph-trash"></i></button>
      </td>
    `;
    DOM.tableBody.appendChild(tr);
  });
}

function renderCharts() {
  const isDark = state.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  
  const sortedTrans = [...state.transactions].sort((a,b) => new Date(a.date) - new Date(b.date));
  let cumulative = 0;
  const dates = [];
  const balances = [];
  
  sortedTrans.forEach(t => {
    cumulative += t.type === 'income' ? t.amount : -t.amount;
    dates.push(formatDate(t.date));
    balances.push(cumulative);
  });
  
  if (lineChartInstance) lineChartInstance.destroy();
  const ctxLine = document.getElementById('lineChart').getContext('2d');
  
  let gradientLine = ctxLine.createLinearGradient(0, 0, 0, 400);
  gradientLine.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
  gradientLine.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  lineChartInstance = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Balance',
        data: balances,
        borderColor: '#6366f1',
        backgroundColor: gradientLine,
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
        tension: 0.4 
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { border: { display: false }, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  const categoryTotals = {};
  state.transactions.forEach(t => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    }
  });
  
  if (pieChartInstance) pieChartInstance.destroy();
  const ctxPie = document.getElementById('pieChart').getContext('2d');
  
  pieChartInstance = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { position: 'right', labels: { color: textColor, padding: 20 } }
      }
    }
  });
}

function renderInsights() {
  const totals = {};
  let totalExpense = 0;
  
  state.transactions.forEach(t => {
    if (t.type === "expense") {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
      totalExpense += Number(t.amount);
    }
  });
  
  if (Object.keys(totals).length === 0) {
    DOM.insights.innerHTML = `<p style="color: var(--text-muted); text-align:center; padding: 20px;">Collect more data to unlock AI Insights.</p>`;
    return;
  }
  
  let maxCat = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
  let percentage = ((totals[maxCat] / totalExpense) * 100).toFixed(1);
  const highestTxn = state.transactions.reduce((max, t) => t.amount > max.amount ? t : max, state.transactions[0]);
  
  DOM.insights.innerHTML = `
    <div class="insight-item">
      <h4>Top Spending</h4>
      <p>Your highest expense category is <strong>${maxCat}</strong>, making up <strong>${percentage}%</strong> of all expenses.</p>
    </div>
    <div class="insight-item">
      <h4>Largest Transaction</h4>
      <p>A <strong>${highestTxn.type}</strong> of <strong>${formatCurrency(highestTxn.amount)}</strong> on <strong>${formatDate(highestTxn.date)}</strong> for ${highestTxn.category}.</p>
    </div>
  `;

  // Budget Logic
  const MOCK_BUDGET = 15000;
  const budgetPercent = (totalExpense / MOCK_BUDGET) * 100;
  const clampedPercent = Math.min(budgetPercent, 100).toFixed(1);
  const isWarning = budgetPercent >= 85;
  const barColorClass = isWarning ? 'danger-bar' : 'safe-bar';
  
  DOM.insights.innerHTML += `
    <div class="insight-item budget-item">
      <div class="budget-header">
         <h4>Monthly Budget Target</h4>
         <span>${formatCurrency(totalExpense)} / ${formatCurrency(MOCK_BUDGET)}</span>
      </div>
      <div class="budget-track">
         <div class="budget-fill ${barColorClass}" style="width: ${clampedPercent}%"></div>
      </div>
      <div class="budget-status ${isWarning ? 'warning-text' : ''}">
         ${clampedPercent}% utilized ${isWarning ? '— Approaching limit!' : '— Excellent standing.'}
      </div>
    </div>
  `;
}

/* ================= MODAL & CRUD ================= */
function openModal(id = null) {
  if (state.role !== 'admin') {
    showToast("Access Denied", "Only admins can modify records.", "error");
    return;
  }
  
  DOM.formId.value = '';
  DOM.formType.value = 'expense';
  DOM.formAmount.value = '';
  DOM.formCategory.value = '';
  DOM.formDate.value = new Date().toISOString().split('T')[0];
  DOM.modalTitle.innerText = 'Add New Record';
  
  if (id) {
    const txn = state.transactions.find(t => t.id === id);
    if (txn) {
      DOM.formId.value = txn.id;
      DOM.formType.value = txn.type;
      DOM.formAmount.value = txn.amount;
      DOM.formCategory.value = txn.category;
      DOM.formDate.value = txn.date;
      DOM.modalTitle.innerText = 'Edit Record';
    }
  }
  
  DOM.modalOverlay.classList.remove('hidden');
}

function closeModal() {
  DOM.modalOverlay.classList.add('hidden');
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const payload = {
    id: DOM.formId.value ? Number(DOM.formId.value) : Date.now(),
    type: DOM.formType.value,
    amount: Number(DOM.formAmount.value),
    category: DOM.formCategory.value.trim(),
    date: DOM.formDate.value
  };
  
  if (DOM.formId.value) {
    const index = state.transactions.findIndex(t => t.id === payload.id);
    if (index !== -1) state.transactions[index] = payload;
    showToast("Updated", "Transaction updated successfully.", "success");
  } else {
    state.transactions.push(payload);
    showToast("Created", "New transaction added successfully.", "success");
  }
  
  closeModal();
  updateUI();
}

function deleteTxn(id) {
  if (state.role !== 'admin') return;
  if (confirm("Are you sure you want to permanently delete this record?")) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    showToast("Deleted", "The transaction was removed.", "info");
    updateUI();
  }
}

/* ================= EXPORT ================= */
function exportToCSV() {
  if (state.transactions.length === 0) {
    showToast("Warning", "No data available to export.", "error");
    return;
  }
  
  const headers = ['Date', 'Amount', 'Category', 'Type'];
  const rows = state.transactions.map(t => [t.date, t.amount, t.category, t.type]);
  const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(e => e.join(",")).join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `NexusFin_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("Exported", "Your data is downloading...", "success");
}

// Boot application
init();