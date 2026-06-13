/* ═══════════════════════════════════════════════════════
   FINOVA BANK DASHBOARD — app.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
let state = {
  user: null,
  theme: 'dark',
  accounts: {
    savings: 24850.75,
    current: 8320.40,
    credit:  3200.00
  },
  transactions: [],
  notifications: [],
  chartInstances: {},
  editingProfile: false,
  profile: {
    first:   'Alex',
    last:    'Johnson',
    email:   'alex.johnson@email.com',
    phone:   '+1 234 567 8900',
    city:    'New York',
    country: 'United States'
  }
};

/* ══════════════════════════════════════
   SEED DATA
══════════════════════════════════════ */
const CATEGORIES = ['Food','Transport','Shopping','Bills','Health','Entertainment','Salary','Transfer','Other'];
const CAT_ICONS  = {
  Food:'🍔', Transport:'🚗', Shopping:'🛍️', Bills:'💡',
  Health:'💊', Entertainment:'🎬', Salary:'💼', Transfer:'🔄', Other:'📦'
};
const CAT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316'];

function seedTransactions() {
  const now   = new Date();
  const seeds = [
    { type:'deposit',  account:'savings', amount:4500, desc:'Monthly Salary',       category:'Salary',        daysAgo:1  },
    { type:'withdraw', account:'current', amount:85,   desc:'Grocery Store',        category:'Food',          daysAgo:1  },
    { type:'withdraw', account:'current', amount:1200, desc:'Apartment Rent',       category:'Bills',         daysAgo:2  },
    { type:'transfer', account:'savings', amount:500,  desc:'Savings Transfer',     category:'Transfer',      daysAgo:2  },
    { type:'withdraw', account:'current', amount:45,   desc:'Uber Ride',            category:'Transport',     daysAgo:3  },
    { type:'withdraw', account:'savings', amount:230,  desc:'Online Shopping',      category:'Shopping',      daysAgo:4  },
    { type:'deposit',  account:'savings', amount:800,  desc:'Freelance Payment',    category:'Salary',        daysAgo:5  },
    { type:'withdraw', account:'current', amount:120,  desc:'Electric Bill',        category:'Bills',         daysAgo:6  },
    { type:'withdraw', account:'current', amount:60,   desc:'Netflix & Spotify',    category:'Entertainment', daysAgo:7  },
    { type:'withdraw', account:'savings', amount:95,   desc:'Pharmacy',             category:'Health',        daysAgo:8  },
    { type:'deposit',  account:'current', amount:200,  desc:'Refund Received',      category:'Other',         daysAgo:9  },
    { type:'withdraw', account:'current', amount:350,  desc:'Amazon Shopping',      category:'Shopping',      daysAgo:10 },
    { type:'withdraw', account:'current', amount:55,   desc:'Restaurant Dinner',    category:'Food',          daysAgo:11 },
    { type:'deposit',  account:'savings', amount:4500, desc:'Monthly Salary',       category:'Salary',        daysAgo:31 },
    { type:'withdraw', account:'current', amount:1200, desc:'Apartment Rent',       category:'Bills',         daysAgo:32 },
    { type:'withdraw', account:'current', amount:400,  desc:'Clothes Shopping',     category:'Shopping',      daysAgo:33 },
    { type:'withdraw', account:'current', amount:110,  desc:'Doctor Visit',         category:'Health',        daysAgo:35 },
    { type:'deposit',  account:'current', amount:600,  desc:'Bonus Payment',        category:'Salary',        daysAgo:38 },
    { type:'withdraw', account:'current', amount:75,   desc:'Fuel',                 category:'Transport',     daysAgo:40 },
    { type:'withdraw', account:'savings', amount:180,  desc:'Gym Membership',       category:'Health',        daysAgo:42 },
    { type:'deposit',  account:'savings', amount:4500, desc:'Monthly Salary',       category:'Salary',        daysAgo:62 },
    { type:'withdraw', account:'current', amount:1200, desc:'Apartment Rent',       category:'Bills',         daysAgo:63 },
    { type:'withdraw', account:'current', amount:290,  desc:'Electronics',          category:'Shopping',      daysAgo:65 },
    { type:'withdraw', account:'current', amount:88,   desc:'Food Delivery',        category:'Food',          daysAgo:68 },
    { type:'deposit',  account:'current', amount:350,  desc:'Side Project',         category:'Salary',        daysAgo:72 },
  ];

  state.transactions = seeds.map((s, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - s.daysAgo);
    return { id: `txn-${i}`, ...s, date: d.toISOString() };
  });
}

function seedNotifications() {
  state.notifications = [
    { id:'n1', type:'success', title:'Deposit Successful',    msg:'$4,500.00 has been credited to your Savings Account.',  time:'2 hours ago',   unread:true  },
    { id:'n2', type:'warning', title:'Low Balance Alert',     msg:'Your Current Account balance is below $500.',           time:'5 hours ago',   unread:true  },
    { id:'n3', type:'info',    title:'New Feature Available', msg:'Try our new analytics dashboard for deeper insights.',  time:'1 day ago',     unread:true  },
    { id:'n4', type:'success', title:'Transfer Completed',    msg:'$500.00 transferred to Savings Account successfully.',  time:'2 days ago',    unread:false },
    { id:'n5', type:'info',    title:'Statement Ready',       msg:'Your monthly statement for May is now available.',      time:'3 days ago',    unread:false },
    { id:'n6', type:'warning', title:'Card Expiry Reminder',  msg:'Your credit card expires in 30 days. Please renew.',    time:'5 days ago',    unread:false },
  ];
}

/* ══════════════════════════════════════
   AUTH
══════════════════════════════════════ */
function showPage(id) {
  document.querySelectorAll('.auth-page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function togglePw(inputId, icon) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text'; icon.classList.replace('fa-eye','fa-eye-slash'); }
  else                         { inp.type = 'password'; icon.classList.replace('fa-eye-slash','fa-eye'); }
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value.trim();
  if (!email || !pass) { showToast('error','Missing Fields','Please enter your email and password.'); return; }
  if (!email.includes('@')) { showToast('error','Invalid Email','Please enter a valid email address.'); return; }
  if (pass.length < 6) { showToast('error','Invalid Password','Password must be at least 6 characters.'); return; }

  const btn = document.querySelector('#loginPage .btn-primary');
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Signing in…';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<span>Sign In</span><i class="fa fa-arrow-right"></i>';
    btn.disabled = false;
    const nameParts = email.split('@')[0].split('.');
    state.profile.first = capitalize(nameParts[0] || 'User');
    state.profile.last  = capitalize(nameParts[1] || '');
    state.profile.email = email;
    launchApp();
  }, 1200);
}

function handleSignup() {
  const first = document.getElementById('signupFirst').value.trim();
  const last  = document.getElementById('signupLast').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const pass  = document.getElementById('signupPassword').value.trim();
  const terms = document.getElementById('signupTerms').checked;

  if (!first||!last||!email||!pass) { showToast('error','Missing Fields','Please fill in all required fields.'); return; }
  if (!email.includes('@'))         { showToast('error','Invalid Email','Please enter a valid email address.'); return; }
  if (pass.length < 8)              { showToast('error','Weak Password','Password must be at least 8 characters.'); return; }
  if (!terms)                       { showToast('error','Terms Required','Please accept the Terms & Privacy Policy.'); return; }

  const btn = document.querySelector('#signupPage .btn-primary');
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Creating account…';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<span>Create Account</span><i class="fa fa-arrow-right"></i>';
    btn.disabled = false;
    state.profile = { first, last, email, phone, city:'New York', country:'United States' };
    launchApp();
  }, 1400);
}

function handleLogout() {
  document.getElementById('appWrapper').classList.add('hidden');
  document.getElementById('authWrapper').classList.remove('hidden');
  showPage('loginPage');
  document.getElementById('loginEmail').value    = '';
  document.getElementById('loginPassword').value = '';
  showToast('info','Logged Out','You have been successfully logged out.');
}

function launchApp() {
  document.getElementById('authWrapper').classList.add('hidden');
  document.getElementById('appWrapper').classList.remove('hidden');
  seedTransactions();
  seedNotifications();
  updateUI();
  renderRecentTransactions();
  renderActivityFeed();
  renderAccounts();
  renderNotifications();
  renderFullTransactions();
  setTimeout(renderCharts, 100);
  setGreeting();
  showToast('success','Welcome Back!',`Hello, ${state.profile.first}! Your dashboard is ready.`);
}

/* ══════════════════════════════════════
   UI UPDATES
══════════════════════════════════════ */
function updateUI() {
  const total    = state.accounts.savings + state.accounts.current + state.accounts.credit;
  const income   = calcMonthlyIncome();
  const expense  = calcMonthlyExpense();
  const savings  = income - expense;

  // Animate numbers
  animateValue('statBalance', 0, total,   1200, true);
  animateValue('statIncome',  0, income,  1000, true);
  animateValue('statExpense', 0, expense, 1000, true);
  animateValue('statSavings', 0, savings > 0 ? savings : 0, 1000, true);

  // Remove skeleton after animation
  setTimeout(() => {
    ['statBalance','statIncome','statExpense','statSavings'].forEach(id => {
      document.getElementById(id)?.classList.remove('skeleton');
    });
  }, 1300);

  const initials = `${state.profile.first[0]||''}${state.profile.last[0]||''}`.toUpperCase();
  setElements({ sidebarAvatar:initials, sidebarName:`${state.profile.first} ${state.profile.last}`, topbarAvatar:initials });
  renderProfilePage();

  const unread = state.notifications.filter(n => n.unread).length;
  document.getElementById('notifBadge').textContent    = unread;
  document.getElementById('topNotifBadge').textContent = unread;
  if (unread === 0) {
    document.getElementById('notifBadge').style.display    = 'none';
    document.getElementById('topNotifBadge').style.display = 'none';
  }
}

function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const el = document.getElementById('greetingText');
  if (el) el.textContent = `${g}, ${state.profile.first} 👋`;
}

function animateValue(id, from, to, duration, isCurrency) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = from + (to - from) * ease;
    el.textContent = isCurrency ? fmt(val) : Math.round(val).toLocaleString();
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = isCurrency ? fmt(to) : to.toLocaleString();
  }
  requestAnimationFrame(update);
}

function setElements(map) {
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function switchSection(name, el) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  // Remove active from nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const sec = document.getElementById(`sec-${name}`);
  if (sec) sec.classList.add('active');
  if (el)  el.classList.add('active');

  const titles = {
    dashboard:'Dashboard', accounts:'Accounts',
    transactions:'Transactions', analytics:'Analytics',
    profile:'Profile', notifications:'Notifications'
  };
  document.getElementById('pageTitle').textContent = titles[name] || name;

  if (name === 'analytics') setTimeout(renderCharts, 50);
  if (name === 'dashboard') { renderRecentTransactions(); renderActivityFeed(); }
  closeSidebarMobile();
}

function toggleSidebar() {
  const sb  = document.getElementById('sidebar');
  const ov  = document.getElementById('sidebarOverlay');
  const open = sb.classList.toggle('open');
  ov.classList.toggle('active', open);
}

function closeSidebarMobile() {
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
}

/* ══════════════════════════════════════
   TRANSACTIONS
══════════════════════════════════════ */
function renderTxnItem(t) {
  const isCr = t.type === 'deposit';
  const sign  = isCr ? '+' : '-';
  const cls   = isCr ? 'pos' : 'neg';
  const iconCls = t.type === 'transfer' ? 'trf' : isCr ? 'dep' : 'with';
  const icon   = t.type === 'transfer' ? 'fa-arrows-left-right' : isCr ? 'fa-arrow-down' : 'fa-arrow-up';
  const date   = new Date(t.date);
  const dateStr = date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const cat    = t.category || 'Other';
  const emoji  = CAT_ICONS[cat] || '📦';

  return `
    <div class="txn-item" id="${t.id}">
      <div class="txn-icon ${iconCls}"><i class="fa ${icon}"></i></div>
      <div class="txn-info">
        <div class="txn-name">${t.desc || capitalize(t.type)}</div>
        <div class="txn-meta">
          <span class="txn-cat">${emoji} ${cat}</span>
          <span>${capitalize(t.account)} Account</span>
        </div>
      </div>
      <div class="txn-right">
        <div class="txn-amount ${cls}">${sign}${fmt(t.amount)}</div>
        <div class="txn-date">${dateStr}</div>
      </div>
    </div>`;
}

function renderRecentTransactions() {
  const el = document.getElementById('recentTxnList');
  if (!el) return;
  const recent = [...state.transactions]
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
  el.innerHTML = recent.length ? recent.map(renderTxnItem).join('') : '<div class="empty-state"><i class="fa fa-inbox"></i><p>No transactions yet</p></div>';
}

function renderFullTransactions(list) {
  const el = document.getElementById('fullTxnList');
  const empty = document.getElementById('txnEmpty');
  if (!el) return;
  const txns = list || [...state.transactions].sort((a,b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = txns.map(renderTxnItem).join('');
  if (empty) empty.classList.toggle('hidden', txns.length > 0);
}

function filterTransactions() {
  const q    = document.getElementById('txnSearch')?.value.toLowerCase() || '';
  const type = document.getElementById('txnTypeFilter')?.value || '';
  const cat  = document.getElementById('txnCatFilter')?.value || '';
  const sort = document.getElementById('txnSortFilter')?.value || 'newest';

  let list = state.transactions.filter(t => {
    const matchQ   = !q    || t.desc?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.account?.toLowerCase().includes(q);
    const matchT   = !type || t.type === type;
    const matchC   = !cat  || t.category === cat;
    return matchQ && matchT && matchC;
  });

  list.sort((a,b) => {
    if (sort === 'newest')  return new Date(b.date) - new Date(a.date);
    if (sort === 'oldest')  return new Date(a.date) - new Date(b.date);
    if (sort === 'highest') return b.amount - a.amount;
    if (sort === 'lowest')  return a.amount - b.amount;
    return 0;
  });

  renderFullTransactions(list);
}

function liveSearch(val) {
  if (!val) return;
  switchSection('transactions', document.querySelector('[onclick*=transactions]'));
  document.getElementById('txnSearch').value = val;
  filterTransactions();
}

/* ══════════════════════════════════════
   ACTIVITY FEED
══════════════════════════════════════ */
function renderActivityFeed() {
  const el = document.getElementById('activityFeed');
  if (!el) return;
  const recent = [...state.transactions]
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);
  const colorMap = { deposit:'green', withdraw:'red', transfer:'blue' };
  el.innerHTML = recent.map(t => {
    const ago = timeAgo(new Date(t.date));
    const col = colorMap[t.type] || 'blue';
    return `
      <div class="activity-item">
        <div class="ai-dot ${col}"></div>
        <div class="ai-text">${t.type === 'deposit' ? 'Received' : t.type === 'withdraw' ? 'Spent' : 'Transferred'} <strong>${fmt(t.amount)}</strong> — ${t.desc}</div>
        <div class="ai-time">${ago}</div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════
   ACCOUNTS
══════════════════════════════════════ */
function renderAccounts() {
  const grid = document.getElementById('accountsGrid');
  if (!grid) return;
  const accounts = [
    { key:'savings', label:'Savings Account',  num:'•••• •••• •••• 4821', cls:'ac-savings', icon:'fa-piggy-bank', change:'+$800 this month' },
    { key:'current', label:'Current Account',  num:'•••• •••• •••• 7634', cls:'ac-current', icon:'fa-credit-card', change:'-$1,200 this month' },
    { key:'credit',  label:'Credit Card',       num:'•••• •••• •••• 9102', cls:'ac-credit',  icon:'fa-circle-dollar-to-slot', change:'$3,200 limit used' },
  ];
  grid.innerHTML = accounts.map(a => `
    <div class="account-card ${a.cls}">
      <div class="ac-type">${a.label}</div>
      <div class="ac-number">${a.num}</div>
      <div class="ac-balance">${fmt(state.accounts[a.key])}</div>
      <div class="ac-change">${a.change}</div>
      <div class="ac-footer">
        <div class="ac-holder">${state.profile.first} ${state.profile.last}</div>
        <div class="ac-icon"><i class="fa ${a.icon}"></i></div>
      </div>
    </div>`).join('');

  const tableEl = document.getElementById('accountSummaryTable');
  if (!tableEl) return;
  const total = state.accounts.savings + state.accounts.current + state.accounts.credit;
  tableEl.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>Account</th><th>Account Number</th><th>Balance</th><th>Status</th><th>Type</th>
      </tr></thead>
      <tbody>
        <tr><td>Savings Account</td><td>#FNV-4821</td><td><strong>${fmt(state.accounts.savings)}</strong></td><td><span class="pill green">Active</span></td><td>Savings</td></tr>
        <tr><td>Current Account</td><td>#FNV-7634</td><td><strong>${fmt(state.accounts.current)}</strong></td><td><span class="pill green">Active</span></td><td>Checking</td></tr>
        <tr><td>Credit Card</td><td>#FNV-9102</td><td><strong>${fmt(state.accounts.credit)}</strong></td><td><span class="pill amber">Limited</span></td><td>Credit</td></tr>
        <tr><td><strong>Total</strong></td><td></td><td><strong>${fmt(total)}</strong></td><td></td><td></td></tr>
      </tbody>
    </table>`;
}

/* ══════════════════════════════════════
   MODALS
══════════════════════════════════════ */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
function closeModalOutside(e, id) {
  if (e.target.classList.contains('modal-overlay')) closeModal(id);
}
function setAmt(inputId, val) {
  const el = document.getElementById(inputId);
  if (el) el.value = val;
}

/* ══════════════════════════════════════
   BANKING OPERATIONS
══════════════════════════════════════ */
function doDeposit() {
  const acct  = document.getElementById('depositAccount').value;
  const amt   = parseFloat(document.getElementById('depositAmount').value);
  const desc  = document.getElementById('depositDesc').value.trim() || 'Deposit';
  if (!amt || amt <= 0) { showToast('error','Invalid Amount','Please enter a valid amount.'); return; }

  state.accounts[acct] += amt;
  addTransaction({ type:'deposit', account:acct, amount:amt, desc, category:'Other' });
  closeModal('depositModal');
  document.getElementById('depositAmount').value = '';
  document.getElementById('depositDesc').value   = '';
  updateUI();
  renderRecentTransactions();
  renderActivityFeed();
  renderAccounts();
  renderFullTransactions();
  showToast('success','Deposit Successful',`${fmt(amt)} deposited to ${capitalize(acct)} Account.`);
  addNotification('success','Deposit Successful',`${fmt(amt)} has been credited to your ${capitalize(acct)} Account.`);
}

function doWithdraw() {
  const acct  = document.getElementById('withdrawAccount').value;
  const amt   = parseFloat(document.getElementById('withdrawAmount').value);
  const cat   = document.getElementById('withdrawCategory').value;
  const desc  = document.getElementById('withdrawDesc').value.trim() || 'Withdrawal';
  if (!amt || amt <= 0)               { showToast('error','Invalid Amount','Please enter a valid amount.'); return; }
  if (amt > state.accounts[acct])     { showToast('error','Insufficient Funds',`Your ${capitalize(acct)} account has only ${fmt(state.accounts[acct])}.`); return; }

  state.accounts[acct] -= amt;
  addTransaction({ type:'withdraw', account:acct, amount:amt, desc, category:cat });
  closeModal('withdrawModal');
  document.getElementById('withdrawAmount').value = '';
  document.getElementById('withdrawDesc').value   = '';
  updateUI();
  renderRecentTransactions();
  renderActivityFeed();
  renderAccounts();
  renderFullTransactions();
  showToast('success','Withdrawal Successful',`${fmt(amt)} withdrawn from ${capitalize(acct)} Account.`);
  addNotification('info','Withdrawal Processed',`${fmt(amt)} debited from your ${capitalize(acct)} Account.`);
}

function doTransfer() {
  const from = document.getElementById('transferFrom').value;
  const to   = document.getElementById('transferTo').value;
  const amt  = parseFloat(document.getElementById('transferAmount').value);
  const note = document.getElementById('transferNote').value.trim() || 'Transfer';
  if (!amt || amt <= 0)             { showToast('error','Invalid Amount','Please enter a valid amount.'); return; }
  if (from === to)                  { showToast('error','Same Account','Please select different accounts.'); return; }
  if (amt > state.accounts[from])   { showToast('error','Insufficient Funds',`Your ${capitalize(from)} account has only ${fmt(state.accounts[from])}.`); return; }

  state.accounts[from] -= amt;
  if (to !== 'external' && state.accounts[to] !== undefined) state.accounts[to] += amt;
  addTransaction({ type:'transfer', account:from, amount:amt, desc:note, category:'Transfer' });
  closeModal('transferModal');
  document.getElementById('transferAmount').value = '';
  document.getElementById('transferNote').value   = '';
  updateUI();
  renderRecentTransactions();
  renderActivityFeed();
  renderAccounts();
  renderFullTransactions();
  showToast('success','Transfer Successful',`${fmt(amt)} transferred from ${capitalize(from)} to ${capitalize(to)}.`);
  addNotification('success','Transfer Completed',`${fmt(amt)} transferred successfully.`);
}

function addTransaction(txn) {
  const t = { id:`txn-${Date.now()}`, date: new Date().toISOString(), ...txn };
  state.transactions.unshift(t);
}

/* ══════════════════════════════════════
   ANALYTICS
══════════════════════════════════════ */
function renderCharts() {
  const months = getLastNMonths(parseInt(document.getElementById('analyticsRange')?.value || 6));
  renderIncomeExpenseChart(months);
  renderMonthlySpendChart(months);
  renderCategoryChart();
}

function getLastNMonths(n) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ label: d.toLocaleDateString('en-US',{month:'short'}), year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

function txnsInMonth(month, year) {
  return state.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

function renderIncomeExpenseChart(months) {
  const ctx = document.getElementById('incomeExpenseChart');
  if (!ctx) return;
  if (state.chartInstances.incomeExpense) state.chartInstances.incomeExpense.destroy();

  const incomeData  = months.map(m => txnsInMonth(m.month,m.year).filter(t=>t.type==='deposit').reduce((s,t)=>s+t.amount,0));
  const expenseData = months.map(m => txnsInMonth(m.month,m.year).filter(t=>t.type!=='deposit').reduce((s,t)=>s+t.amount,0));

  state.chartInstances.incomeExpense = new Chart(ctx, {
    type:'bar',
    data:{
      labels: months.map(m=>m.label),
      datasets:[
        { label:'Income',  data:incomeData,  backgroundColor:'rgba(16,185,129,0.8)', borderRadius:6, borderSkipped:false },
        { label:'Expense', data:expenseData, backgroundColor:'rgba(239,68,68,0.8)',  borderRadius:6, borderSkipped:false }
      ]
    },
    options: chartOptions()
  });
}

function renderMonthlySpendChart(months) {
  const ctx = document.getElementById('monthlySpendChart');
  if (!ctx) return;
  if (state.chartInstances.monthlySpend) state.chartInstances.monthlySpend.destroy();

  const data = months.map(m => txnsInMonth(m.month,m.year).filter(t=>t.type!=='deposit').reduce((s,t)=>s+t.amount,0));

  state.chartInstances.monthlySpend = new Chart(ctx, {
    type:'line',
    data:{
      labels: months.map(m=>m.label),
      datasets:[{
        label:'Spending', data,
        borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.12)',
        tension:0.4, fill:true, pointBackgroundColor:'#6366f1',
        pointRadius:4, pointHoverRadius:6, borderWidth:2
      }]
    },
    options: chartOptions()
  });
}

function renderCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  const lgd = document.getElementById('catLegend');
  if (!ctx || !lgd) return;
  if (state.chartInstances.category) state.chartInstances.category.destroy();

  const catTotals = {};
  state.transactions.filter(t => t.type !== 'deposit').forEach(t => {
    const c = t.category || 'Other';
    catTotals[c] = (catTotals[c] || 0) + t.amount;
  });
  const labels = Object.keys(catTotals);
  const data   = Object.values(catTotals);
  const total  = data.reduce((s,v) => s+v, 0);
  const colors = CAT_COLORS.slice(0, labels.length);

  state.chartInstances.category = new Chart(ctx, {
    type:'doughnut',
    data:{ labels, datasets:[{ data, backgroundColor:colors, borderWidth:0, hoverOffset:8 }] },
    options:{
      responsive:true, plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{ label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw/total)*100).toFixed(1)}%)` } }
      },
      cutout:'65%'
    }
  });

  lgd.innerHTML = labels.map((l,i) => `
    <div class="cl-item">
      <div class="cl-dot" style="background:${colors[i]}"></div>
      <div class="cl-label">${l}</div>
      <div class="cl-pct">${((data[i]/total)*100).toFixed(1)}%</div>
    </div>`).join('');
}

function chartOptions() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? '#8892b0' : '#718096';
  return {
    responsive:true, maintainAspectRatio:true,
    plugins:{ legend:{ labels:{ color:textColor, font:{ family:'Inter', size:12 }, boxWidth:12, padding:16 } } },
    scales:{
      x:{ grid:{ color:gridColor }, ticks:{ color:textColor, font:{ family:'Inter' } } },
      y:{ grid:{ color:gridColor }, ticks:{ color:textColor, font:{ family:'Inter' }, callback: v => '$'+v.toLocaleString() } }
    }
  };
}

/* ══════════════════════════════════════
   PROFILE
══════════════════════════════════════ */
function renderProfilePage() {
  const p = state.profile;
  const fullName = `${p.first} ${p.last}`.trim();
  const initials = `${p.first[0]||''}${p.last[0]||''}`.toUpperCase();

  setElements({
    profileAvatar:initials, profileDisplayName:fullName, profileDisplayEmail:p.email,
    pvFirst:p.first, pvLast:p.last, pvEmail:p.email, pvPhone:p.phone, pvCity:p.city, pvCountry:p.country,
    editFirst:p.first, editLast:p.last, editEmail:p.email, editPhone:p.phone, editCity:p.city, editCountry:p.country
  });

  // Also set input values
  ['First','Last','Email','Phone','City','Country'].forEach(k => {
    const el = document.getElementById(`edit${k}`);
    if (el) el.value = p[k.toLowerCase()] || '';
  });
}

function toggleEditProfile() {
  state.editingProfile = !state.editingProfile;
  document.getElementById('profileViewMode').classList.toggle('hidden', state.editingProfile);
  document.getElementById('profileEditMode').classList.toggle('hidden', !state.editingProfile);
  document.getElementById('editProfileBtn').innerHTML = state.editingProfile
    ? '<i class="fa fa-times"></i> Cancel'
    : '<i class="fa fa-pen"></i> Edit Profile';
}

function saveProfile() {
  const first   = document.getElementById('editFirst').value.trim();
  const last    = document.getElementById('editLast').value.trim();
  const email   = document.getElementById('editEmail').value.trim();
  const phone   = document.getElementById('editPhone').value.trim();
  const city    = document.getElementById('editCity').value.trim();
  const country = document.getElementById('editCountry').value.trim();

  if (!first || !email) { showToast('error','Required Fields','First name and email are required.'); return; }
  if (!email.includes('@')) { showToast('error','Invalid Email','Please enter a valid email.'); return; }

  state.profile = { first, last, email, phone, city, country };
  renderProfilePage();
  updateUI();
  toggleEditProfile();
  showToast('success','Profile Updated','Your profile has been saved successfully.');
}

function changeAvatar() {
  const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899'];
  const color  = colors[Math.floor(Math.random() * colors.length)];
  const els    = ['profileAvatar','sidebarAvatar','topbarAvatar'];
  els.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.background = color;
  });
  showToast('info','Avatar Updated','Your avatar color has been changed.');
}

/* ══════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════ */
function renderNotifications() {
  const el = document.getElementById('notifList');
  if (!el) return;
  if (!state.notifications.length) {
    el.innerHTML = '<div class="empty-state"><i class="fa fa-bell-slash"></i><p>No notifications</p></div>';
    return;
  }
  const colorMap = { success:'var(--green)', warning:'var(--amber)', info:'var(--primary)', error:'var(--red)' };
  const iconMap  = { success:'fa-check-circle', warning:'fa-triangle-exclamation', info:'fa-circle-info', error:'fa-circle-xmark' };
  el.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.unread?'unread':''}" id="${n.id}">
      <div class="ni-icon" style="background:${colorMap[n.type]}22;color:${colorMap[n.type]}">
        <i class="fa ${iconMap[n.type]||'fa-bell'}"></i>
      </div>
      <div class="ni-info">
        <div class="ni-title">${n.title}</div>
        <div class="ni-msg">${n.msg}</div>
        <div class="ni-time">${n.time}</div>
      </div>
      <button class="ni-dismiss" onclick="dismissNotif('${n.id}')"><i class="fa fa-times"></i></button>
    </div>`).join('');
}

function addNotification(type, title, msg) {
  const n = { id:`n${Date.now()}`, type, title, msg, time:'Just now', unread:true };
  state.notifications.unshift(n);
  renderNotifications();
  updateBadge();
}

function dismissNotif(id) {
  state.notifications = state.notifications.filter(n => n.id !== id);
  renderNotifications();
  updateBadge();
}

function clearAllNotifs() {
  state.notifications = [];
  renderNotifications();
  updateBadge();
  showToast('info','Cleared','All notifications have been cleared.');
}

function updateBadge() {
  const unread = state.notifications.filter(n => n.unread).length;
  ['notifBadge','topNotifBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = unread; el.style.display = unread ? '' : 'none'; }
  });
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(type, title, msg) {
  const container = document.getElementById('toastContainer');
  const iconMap   = { success:'fa-check-circle', error:'fa-circle-xmark', info:'fa-circle-info', warning:'fa-triangle-exclamation' };
  const id        = `toast-${Date.now()}`;
  const el        = document.createElement('div');
  el.className    = `toast ${type}`;
  el.id           = id;
  el.innerHTML    = `
    <div class="toast-icon"><i class="fa ${iconMap[type]||'fa-bell'}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button class="toast-close" onclick="removeToast('${id}')"><i class="fa fa-times"></i></button>
    <div class="toast-bar"></div>`;
  container.appendChild(el);
  setTimeout(() => removeToast(id), 3800);
}

function removeToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('removing');
  setTimeout(() => el.remove(), 320);
}

/* ══════════════════════════════════════
   THEME
══════════════════════════════════════ */
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  document.getElementById('themeIcon').className  = `fa ${state.theme === 'dark' ? 'fa-moon' : 'fa-sun'}`;
  document.getElementById('themeLabel').textContent = state.theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  // Rebuild charts with new colors
  if (document.getElementById('sec-analytics').classList.contains('active')) {
    setTimeout(renderCharts, 50);
  }
  showToast('info', state.theme === 'dark' ? 'Dark Mode' : 'Light Mode', 'Theme switched successfully.');
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function fmt(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function timeAgo(date) {
  const diff = (Date.now() - date) / 1000;
  if (diff < 60)        return 'Just now';
  if (diff < 3600)      return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff/3600)}h ago`;
  if (diff < 2592000)   return `${Math.floor(diff/86400)}d ago`;
  return `${Math.floor(diff/2592000)}mo ago`;
}

function calcMonthlyIncome() {
  const now = new Date();
  return state.transactions
    .filter(t => { const d=new Date(t.date); return t.type==='deposit' && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); })
    .reduce((s,t) => s+t.amount, 0);
}

function calcMonthlyExpense() {
  const now = new Date();
  return state.transactions
    .filter(t => { const d=new Date(t.date); return t.type!=='deposit' && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); })
    .reduce((s,t) => s+t.amount, 0);
}

/* ══════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['depositModal','withdrawModal','transferModal'].forEach(closeModal);
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('globalSearch')?.focus();
  }
});

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill demo credentials
  const emailEl = document.getElementById('loginEmail');
  const passEl  = document.getElementById('loginPassword');
  if (emailEl) emailEl.value = 'alex.johnson@email.com';
  if (passEl)  passEl.value  = 'password123';
  console.log('%c🏦 Finova Bank Dashboard loaded!', 'color:#6366f1;font-weight:bold;font-size:14px;');
  console.log('%cDemo login: alex.johnson@email.com / password123', 'color:#10b981;font-size:12px;');
});