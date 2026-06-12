export function initAllEntityPickers(panel) {
  panel.shadowRoot.querySelectorAll('.entity-picker').forEach((container) => initEntityPicker(panel, container));
}

export function initEntityPicker(panel, container) {
  const placeholder = container.dataset.placeholder || 'Search…';
  const allowedDomains = container.dataset.domains
    ? container.dataset.domains.split(',').map((d) => d.trim()) : [];

  container.innerHTML = `
    <div class="ep-wrap">
      <div class="ep-selected" tabindex="0">
        <span class="ep-selected-icon">📋</span>
        <span class="ep-selected-label">— not selected —</span>
        <span class="ep-clear" style="display:none">✕</span>
      </div>
      <div class="ep-dropdown" style="display:none">
        <input class="ep-search" type="text" placeholder="${placeholder}" autocomplete="off" spellcheck="false" />
        <div class="ep-list"></div>
      </div>
    </div>`;

  const wrap = container.querySelector('.ep-wrap');
  const selBox = container.querySelector('.ep-selected');
  const dropdown = container.querySelector('.ep-dropdown');
  const search = container.querySelector('.ep-search');
  const list = container.querySelector('.ep-list');
  const clearBtn = container.querySelector('.ep-clear');
  const selLabel = container.querySelector('.ep-selected-label');
  const selIcon = container.querySelector('.ep-selected-icon');

  const domainIcon = (d) => ({ button: '🔘', text: '📝', sensor: '📡', switch: '🔌', select: '📋' }[d] || '🔷');

  const render = (q = '') => {
    const query = q.toLowerCase();
    const items = panel._allEntities
      .filter((e) => !allowedDomains.length || allowedDomains.includes(e.domain))
      .filter((e) => !query || e.entity_id.toLowerCase().includes(query) || e.friendlyName.toLowerCase().includes(query))
      .slice(0, 60);

    if (!items.length) {
      list.innerHTML = '<div class="ep-no-results">No matching entities</div>';
      return;
    }

    list.innerHTML = items.map((e) => `
      <div class="ep-item" data-id="${e.entity_id}">
        <span class="ep-item-icon">${domainIcon(e.domain)}</span>
        <span class="ep-item-body">
          <span class="ep-item-name">${e.friendlyName}</span>
          <span class="ep-item-id">${e.entity_id}</span>
        </span>
        <span class="ep-item-domain">${e.domain}</span>
      </div>`).join('');

    list.querySelectorAll('.ep-item').forEach((item) => item.addEventListener('click', () => select(item.dataset.id)));
  };

  const select = (entityId) => {
    const entity = panel._allEntities.find((x) => x.entity_id === entityId);
    if (!entity) return;
    container.dataset.selected = entityId;
    selLabel.textContent = `${entity.friendlyName}  (${entityId})`;
    selIcon.textContent = domainIcon(entity.domain);
    clearBtn.style.display = '';
    close();
  };

  const open = () => {
    dropdown.style.display = '';
    search.value = '';
    render('');
    search.focus();
  };

  const close = () => { dropdown.style.display = 'none'; };

  selBox.addEventListener('click', () => (dropdown.style.display === 'none' ? open() : close()));
  search.addEventListener('input', () => render(search.value));
  clearBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    delete container.dataset.selected;
    selLabel.textContent = '— not selected —';
    selIcon.textContent = '📋';
    clearBtn.style.display = 'none';
  });
  panel.shadowRoot.addEventListener('click', (event) => { if (!wrap.contains(event.target)) close(); });
  render('');
}
