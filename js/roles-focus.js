// Roles and Focus data - value keys used in storage
const ROLES = [
  'founder','co-founder','startup-ceo','cto','product-manager','project-manager',
  'frontend-developer','backend-developer','full-stack-developer','mobile-developer','ios-developer','android-developer',
  'ai-engineer','ml-engineer','data-scientist','data-analyst',
  'devops-engineer','cloud-engineer','cybersecurity-specialist',
  'ui-designer','ux-designer','product-designer','graphic-designer','motion-designer','3d-designer',
  'game-developer','game-designer',
  'qa-engineer','test-automation-engineer',
  'marketing-specialist','growth-hacker','digital-marketer','performance-marketer','seo-specialist','content-marketer','smm-manager',
  'sales-manager','bd-manager','finance-manager','startup-advisor',
  'recruiter','hr-manager','community-manager',
  'nocode-developer','webflow-developer','bubble-developer',
  'blockchain-developer','web3-developer'
];

const FOCUS = [
  'ai','machine-learning','saas','fintech','crypto','blockchain','web3',
  'healthtech','biotech','edtech','ecommerce','marketplace','mobile-apps','web-apps','social-network','gaming','ar-vr','iot',
  'cybersecurity','cloud-computing','big-data','automation','robotics','climate-tech','green-energy','travel-tech','food-tech',
  'proptech','legal-tech','agritech','sports-tech','media-tech','creator-economy'
];

function ensureArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

function createMultiselect(containerId, options, prefix, selected = [], placeholderKey = 'auth.selectRoles') {
  const container = document.getElementById(containerId);
  if (!container) return { getSelected: () => [], refreshLabels: () => {} };

  let selectedSet = new Set(ensureArray(selected));

  let searchQuery = '';
  function render() {
    const labelEl = container.querySelector('.multiselect-label') || document.createElement('div');
    labelEl.className = 'multiselect-label';
    labelEl.innerHTML = selectedSet.size > 0
      ? [...selectedSet].map(v => `<span class="multiselect-tag" data-value="${v}">${escapeHtml(t(prefix + v))} ×</span>`).join(' ')
      : `<span class="multiselect-placeholder">${t(placeholderKey)}</span>`;
    labelEl.onclick = (e) => {
      e.stopPropagation();
      if (e.target.closest('.multiselect-tag')) {
        selectedSet.delete(e.target.closest('.multiselect-tag').dataset.value);
        render();
      } else {
        const dd = container.querySelector('.multiselect-dropdown');
        if (dd) {
          dd.classList.toggle('open');
          if (dd.classList.contains('open')) {
            setTimeout(() => dd.querySelector('.multiselect-search')?.focus(), 50);
          }
        }
      }
    };

    const wrap = container.querySelector('.multiselect-wrap') || document.createElement('div');
    wrap.className = 'multiselect-wrap';
    if (!wrap.querySelector('.multiselect-label')) wrap.appendChild(labelEl);

    const dd = container.querySelector('.multiselect-dropdown') || document.createElement('div');
    dd.className = 'multiselect-dropdown';
    dd.innerHTML = `<input type="text" class="multiselect-search" placeholder="${escapeHtml(t(placeholderKey))}..." autocomplete="off">`;
    const inp = dd.querySelector('.multiselect-search');
    inp.value = searchQuery;
    inp.addEventListener('input', (e) => {
      searchQuery = (e.target.value || '').toLowerCase();
      renderDropdown();
      e.stopPropagation();
    });
    inp.addEventListener('click', (e) => e.stopPropagation());
    renderDropdown();
    if (!wrap.querySelector('.multiselect-dropdown')) wrap.appendChild(dd);

    container.innerHTML = '';
    container.appendChild(wrap);

    document.addEventListener('click', function closeDd(e) {
      if (!container.contains(e.target)) { dd.classList.remove('open'); document.removeEventListener('click', closeDd); }
    });
  }

  function renderDropdown() {
    const dd = container.querySelector('.multiselect-dropdown');
    if (!dd) return;
    const searchInput = dd.querySelector('.multiselect-search');
    const filtered = !searchQuery ? options : options.filter(v => {
      const label = (t(prefix + v) || v).toLowerCase();
      return label.includes(searchQuery);
    });
    const listHtml = filtered.map(v => {
      const checked = selectedSet.has(v);
      return `<label class="multiselect-option"><input type="checkbox" value="${v}" ${checked ? 'checked' : ''}> ${escapeHtml(t(prefix + v))}</label>`;
    }).join('');
    const listEl = dd.querySelector('.multiselect-list') || document.createElement('div');
    listEl.className = 'multiselect-list';
    listEl.innerHTML = listHtml;
    if (!dd.querySelector('.multiselect-list')) dd.appendChild(listEl);
    listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) selectedSet.add(cb.value); else selectedSet.delete(cb.value);
        render();
        renderDropdown();
      });
    });
  }

  render();
  const api = {
    getSelected: () => [...selectedSet],
    refreshLabels: () => render()
  };
  container._multiselectRefresh = () => api.refreshLabels();
  return api;
}

function escapeHtml(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
