const state = {
  view: 'home',
  mode: 'Builder',
  price: { base: 39, complexity: 20, support: 12, market: 8 },
  sections: [
    ['App Type', 'Client Portal', 'Defines the buyer-facing product category.'],
    ['Audience', 'Service teams', 'Clarifies who the product serves first.'],
    ['Core Outcome', 'Launch-ready workspace', 'Names the result the app must create.'],
    ['Data Model', 'Projects, specs, clones', 'Defines records and workspace objects.'],
    ['Workflow', 'Click-only builder', 'Maps the user path from idea to export.'],
    ['Dashboard', 'Builder / Launcher split', 'Sets the main navigation and status surface.'],
    ['Marketplace', 'Creator profiles', 'Packages apps for clone-ready publishing.'],
    ['Onboarding', 'Brand, Content, Features, Updates, Go Live', 'Defines post-clone setup.'],
    ['Pricing', 'Formula advisor', 'Calculates recommended publish price.'],
    ['Launch Package', '10-section export', 'Creates the handoff spec for teams and local AIs.']
  ],
  projects: [
    ['Spec system', 'Design', 'In review', 'Low', 'High'],
    ['Portfolio table', 'Product', 'Ready', 'Low', 'Medium'],
    ['Marketplace clone flow', 'Launch', 'Build', 'Medium', 'High'],
    ['Pricing advisor', 'Finance', 'Ready', 'Low', 'High'],
    ['Creator profiles', 'Growth', 'Planned', 'Medium', 'Medium'],
    ['Export engine', 'Engineering', 'Ready', 'Low', 'High']
  ],
  marketplace: [
    ['Atlas CRM', 'Maya Chen', '$79', 'Client portal with launch workflow'],
    ['FieldOps Board', 'Nolan Reid', '$99', 'Operations app for crews and managers'],
    ['Creator Kit', 'Iris Vale', '$59', 'Content system with clone onboarding']
  ],
  steps: ['Brand', 'Audience', 'Content', 'Features', 'Updates', 'Go Live']
};

const views = ['home', 'builder', 'portfolio', 'marketplace', 'launcher'];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function priceTotal() {
  return Object.values(state.price).reduce((sum, n) => sum + n, 0);
}

function card(title, body, meta = '') {
  return `<article class="card"><small>${meta}</small><h2>${title}</h2><p>${body}</p></article>`;
}

function renderHome() {
  $('#home').innerHTML = `
    ${card('Builder home', 'Click through product choices and turn them into a clean 10-section app spec.', 'Create')}
    ${card('Launcher home', 'Publish clone-ready apps with onboarding, pricing, profiles, and release updates.', 'Sell')}
    ${card('Professional export', 'The export is structured for builders, local AIs, teams, and clients.', 'Handoff')}
    ${card('Project workspace', 'Portfolio cards and detailed table views keep builds organized.', 'Operate')}
  `;
}

function renderBuilder() {
  $('#builder').innerHTML = state.sections.map((section, index) => `
    <button class="section-card" data-section="${index}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <strong>${section[0]}</strong>
      <em>${section[1]}</em>
      <small>${section[2]}</small>
    </button>
  `).join('');
}

function renderPortfolio() {
  $('#portfolio').innerHTML = `
    <article class="panel">
      <div class="panel-head"><small>Project workspace</small><h2>Detailed table view</h2></div>
      <table><thead><tr><th>Workstream</th><th>Owner</th><th>Status</th><th>Risk</th><th>Launch impact</th></tr></thead>
      <tbody>${state.projects.map(row => `<tr>${row.map(item => `<td>${item}</td>`).join('')}</tr>`).join('')}</tbody></table>
    </article>
  `;
}

function renderMarketplace() {
  $('#marketplace').innerHTML = state.marketplace.map(app => `
    <article class="card market"><small>${app[1]}</small><h2>${app[0]}</h2><p>${app[3]}</p><strong>${app[2]}</strong><button>View clone setup</button></article>
  `).join('');
}

function renderLauncher() {
  $('#launcher').innerHTML = `
    <article class="card"><small>6-step setup</small><h2>Post-clone onboarding</h2><p>${state.steps.join(' → ')}</p></article>
    <article class="card"><small>Pricing formula</small><h2>$${priceTotal()}</h2><p>Base ${state.price.base} + complexity ${state.price.complexity} + support ${state.price.support} + market ${state.price.market}</p></article>
    <article class="card"><small>Publish checklist</small><h2>Launcher ready</h2><p>Brand kit, content defaults, feature toggles, update plan, and go-live handoff.</p></article>
  `;
}

function renderExport() {
  const text = state.sections.map((s, i) => `${i + 1}. ${s[0]} — ${s[1]}\n${s[2]}`).join('\n\n');
  navigator.clipboard?.writeText(text);
  alert('10-section export generated and copied when clipboard access is available.');
}

function switchView(view) {
  state.view = view;
  views.forEach((name) => $(`#${name}`).classList.toggle('active', name === view));
  $$('.nav').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
  $('#view-title').textContent = {
    home: 'Professional app specification studio',
    builder: 'Click-only 10-section spec builder',
    portfolio: 'Portfolio and project workspace',
    marketplace: 'Clone-ready app marketplace',
    launcher: 'Launcher publish and pricing flow'
  }[view];
}

function init() {
  renderHome();
  renderBuilder();
  renderPortfolio();
  renderMarketplace();
  renderLauncher();
  $('#price').textContent = `$${priceTotal()}`;
  $$('.nav').forEach((btn) => btn.addEventListener('click', () => switchView(btn.dataset.view)));
  $('#exportBtn').addEventListener('click', renderExport);
  $('#cloneBtn').addEventListener('click', () => switchView('launcher'));
}

init();
