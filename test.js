
  // Search Filter Logic
  document.getElementById('projectSearch').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
      const meta = card.querySelector('.concept-meta');
      if (meta) {
        const text = meta.textContent.toLowerCase();
        if (text.includes(term)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      }
    });
  });

  // Status Indicator Dropdown Logic
  const STATUS_CYCLE = [
    { text: 'Standby', color: '#64748b', border: 'rgba(100,116,139,0.3)', bg: 'rgba(100,116,139,0.1)' },
    { text: 'In Progress', color: 'var(--blue)', border: 'rgba(76,201,240,0.3)', bg: 'rgba(76,201,240,0.1)' },
    { text: 'Active Production', color: '#f72585', border: 'rgba(247,37,133,0.3)', bg: 'rgba(247,37,133,0.1)' },
    { text: 'Ready for Review', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.1)' },
    { text: 'Season 1 Candidate', color: 'var(--green)', border: 'rgba(0,229,160,0.3)', bg: 'rgba(0,229,160,0.1)' },
    { text: 'Pilot Episode', color: 'var(--blue)', border: 'rgba(76,201,240,0.3)', bg: 'rgba(76,201,240,0.1)' },
    { text: 'Completed', color: 'var(--green)', border: 'rgba(0,229,160,0.3)', bg: 'rgba(0,229,160,0.1)' }
  ];

  document.querySelectorAll('.status-indicator').forEach(indicator => {
    const cardId = indicator.closest('.project-card').id;
    if (!cardId) return;

    const span = indicator.querySelector('span');
    const defaultText = span.innerText;

    // Create dropdown select
    const select = document.createElement('select');
    select.className = 'status-select';
    
    STATUS_CYCLE.forEach(status => {
      const option = document.createElement('option');
      option.value = status.text;
      option.innerText = status.text;
      select.appendChild(option);
    });

    // Replace span with select
    indicator.replaceChild(select, span);

    // Stop link navigation when interacting with dropdown
    indicator.addEventListener('click', e => e.preventDefault());
    select.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
    
    // Load from local storage or set default
    const savedStatus = localStorage.getItem('status_' + cardId);
    let activeStatusData = null;
    
    if (savedStatus) {
      activeStatusData = JSON.parse(savedStatus);
      select.value = activeStatusData.text;
    } else {
      select.value = defaultText;
      activeStatusData = STATUS_CYCLE.find(s => s.text === defaultText) || STATUS_CYCLE[0];
    }
    
    applyStatus(indicator, select, activeStatusData);

    // Handle change
    select.addEventListener('change', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedStatus = STATUS_CYCLE.find(s => s.text === select.value);
      applyStatus(indicator, select, selectedStatus);
      localStorage.setItem('status_' + cardId, JSON.stringify(selectedStatus));
      updateTelemetryDashboard();
    });
  });

  function applyStatus(indicator, select, statusData) {
    if (!statusData) return;
    indicator.style.color = statusData.color;
    select.style.color = statusData.color;
    indicator.style.borderColor = statusData.border;
    indicator.style.background = statusData.bg;
    indicator.querySelector('.dot').style.background = statusData.color;
    indicator.querySelector('.dot').style.boxShadow = `0 0 10px ${statusData.color}`;
  }

  function updateTelemetryDashboard() {
    const cards = document.querySelectorAll('.project-card');
    let total = cards.length;
    let completed = 0;
    
    const domains = {};
    const cuedItems = [];

    cards.forEach(card => {
      if (card.id === 'card-template') {
        total--;
        return; 
      }

      const select = card.querySelector('.status-select');
      const statusText = select ? select.value : '';
      
      if (statusText === 'Completed') completed++;
      if (statusText === 'Standby' || statusText === 'Ready for Review') {
        const titleEl = card.querySelector('.concept-title');
        if (titleEl) {
          cuedItems.push({ title: titleEl.innerText, status: statusText });
        }
      }

      const badge = card.querySelector('.concept-type-badge');
      if (badge) {
        const domain = badge.innerText.trim();
        domains[domain] = (domains[domain] || 0) + 1;
      }
    });

    const progressFill = document.getElementById('telemetry-progress-bar');
    const progressText = document.getElementById('telemetry-progress-text');
    if (progressFill && progressText) {
      const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
      progressFill.style.width = pct + '%';
      progressText.innerHTML = `${completed} / ${total} Completed <span style="opacity:0.5; font-size:11px; float:right;">${pct}%</span>`;
    }

    const domainList = document.getElementById('telemetry-domain-list');
    if (domainList) {
      domainList.innerHTML = '';
      Object.entries(domains).sort((a,b) => b[1] - a[1]).forEach(([domain, count]) => {
        domainList.innerHTML += `<li><span>${domain}</span> <span class="count">${count}</span></li>`;
      });
    }

    const cuedList = document.getElementById('telemetry-cued-list');
    if (cuedList) {
      cuedList.innerHTML = '';
      if (cuedItems.length === 0) {
        cuedList.innerHTML = `<li><span style="opacity:0.5">No items cued</span></li>`;
      } else {
        cuedItems.slice(0, 4).forEach(item => {
          let color = item.status === 'Ready for Review' ? '#f59e0b' : '#64748b';
          cuedList.innerHTML += `<li><span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 160px;" title="${item.title}">${item.title}</span> <span class="status-tag" style="color:${color}; border-color:${color}40;">${item.status}</span></li>`;
        });
      }
    }
  }

  // Initialize telemetry on load
  updateTelemetryDashboard();

  // Cinematic Scroll & Spotlight Logic
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  const coverWrapper = document.querySelector('.cover-wrapper');
  if (coverWrapper) observer.observe(coverWrapper);

  document.querySelectorAll('.project-card').forEach((card, index) => {
    // Add classes dynamically
    card.classList.add('fade-up', 'spotlight-card');
    
    // Stagger delay based on grid index (mod 3 for columns)
    const delayClass = `delay-${(index % 3) + 1}`;
    card.classList.add(delayClass);
    
    observer.observe(card);

    // Spotlight mouse tracking
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });


