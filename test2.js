
  // Search Filter Logic
  document.getElementById('projectSearch').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const sections = document.querySelectorAll('.category-section');
    
    sections.forEach(section => {
      const cards = section.querySelectorAll('.project-card');
      let sectionHasVisibleCards = false;

      cards.forEach(card => {
        const meta = card.querySelector('.concept-meta');
        if (meta) {
          const text = meta.textContent.toLowerCase();
          if (text.includes(term)) {
            card.style.display = 'block';
            sectionHasVisibleCards = true;
          } else {
            card.style.display = 'none';
          }
        }
      });

      section.style.display = sectionHasVisibleCards ? 'block' : 'none';
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

  
  // ── WIZARD LOGIC ──
  const fab = document.getElementById('fab-init-shoot');
  const modal = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const generateBtn = document.getElementById('wiz-generate');
  const outputDiv = document.getElementById('wiz-output');
  const copyBtn = document.getElementById('wiz-copy');
  const dlBtn = document.getElementById('wiz-download');
  let generatedBlobUrl = null;

  fab.addEventListener('click', () => modal.classList.add('active'));
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if(e.target === modal) modal.classList.remove('active');
  });

  generateBtn.addEventListener('click', () => {
    const id = document.getElementById('wiz-id').value.trim() || 'NewShoot';
    const title = document.getElementById('wiz-title').value.trim() || 'UNTITLED SHOOT';
    const tagline = document.getElementById('wiz-tagline').value.trim() || 'Brief Details';
    const badge = document.getElementById('wiz-badge').value.trim() || 'New Division';
    
    // 1. Generate Card Code
    const cardHtml = `
    <!-- ${id.toUpperCase()} PROJECT CARD -->
    <a href="${id}/${id.toLowerCase()}-shoot-brief.html" id="card-${id.toLowerCase()}" class="concept-card project-card hero">
      <div class="concept-generated-img" style="height: 250px; background: rgba(0,0,0,0.5);">
         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" style="margin: auto; display:block; padding-top: 100px;">
           <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
           <circle cx="8.5" cy="8.5" r="1.5"></circle>
           <polyline points="21 15 16 10 5 21"></polyline>
         </svg>
      </div>
      <div class="concept-meta">
        <div class="concept-type-badge">${badge}</div>
        <h3 class="concept-title">${title}</h3>
        <p class="concept-tagline">${tagline}</p>
        <div class="status-indicator">
          <div class="dot"></div>
          <span>Standby</span>
        </div>
      </div>
    </a>`;
    
    document.getElementById('wiz-code').value = cardHtml;
    document.getElementById('out-folder').innerText = id;
    
    // 2. Generate Brief File (Blob)
    const rawTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shoot Brief Template — Command Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/theme.css">
</head>
<body>

<div style="padding: 40px 48px 0; max-width: 1100px; margin: 0 auto;">
  <a href="../index.html" style="color: var(--green); text-decoration: none; font-family: var(--font-display); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; border-bottom: 1px solid var(--border); padding-bottom: 4px; transition: color 0.2s ease;">← Back to Command Center</a>
</div>

<!-- ══ COVER ══════════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-content">
    <div class="cover-meta">
      [Doc Code] <span>/</span> [Organization] <span>/</span> [Department] 
    </div>
    <h1>Photography Brief:<br><em>[Project Title]</em></h1>
    <div class="cover-tag"><span class="pulse-dot"></span> [X] Shot Concepts · AI Prompts Included</div>
    <div class="cover-sub">
      <div><strong>Faculty/Subject</strong><br>[Name]</div>
      <div><strong>Location</strong><br>[Building / Lab]</div>
      <div><strong>Funding</strong><br>[Grant Info]</div>
      <div><strong>Date</strong><br>[Month Year]</div>
    </div>
  </div>
</div>

<!-- ══ MAIN RESEARCH / CONTEXT ════════════════════════════ -->
<main class="page">
  <div class="section-label">
    <div class="section-num">01</div>
    <h2>Project Context</h2>
  </div>

  <div class="research-grid">
    <div class="info-card">
      <h3>The Challenge / Hypothesis</h3>
      <p>[Explain the core scientific or thematic challenge being researched or highlighted in this shoot.]</p>
    </div>
    <div class="info-card">
      <h3>The Solution / Innovation</h3>
      <p>[Explain the novel approach or discovery being made by the subjects.]</p>
    </div>
  </div>

<!-- ══ SHOT CONCEPTS ══════════════════════════════════════ -->
  <div class="section-label">
    <div class="section-num">02</div>
    <h2>Shot Concepts</h2>
  </div>

  <div class="type-divider hero">
    <h3>Concept Category (e.g., Posed / Hero)</h3>
  </div>

  <!-- CONCEPT A -->
  <div class="concept-card hero" id="concept-a">
    <div class="concept-header">
      <div class="concept-num">A</div>
      <div class="concept-meta">
        <div class="concept-type-badge">Primary Hero Shot</div>
        <div class="concept-title">[Shot Title]</div>
        <div class="concept-tagline">[One sentence summary of the shot's goal]</div>
      </div>
    </div>

    <div class="concept-body">
      <div class="concept-desc">
        <p>[Describe the visual direction, composition, framing, and mood in detail.]</p>
        <ul>
          <li>[Key compositional note]</li>
          <li>[Lighting or interaction note]</li>
        </ul>
      </div>
      
      <div class="concept-tech">
        <h5>Technical Notes</h5>
        <div class="tech-line"><span class="tech-key">Aperture</span><span class="tech-val">[f-stop]</span></div>
        <div class="tech-line"><span class="tech-key">Focal Length</span><span class="tech-val">[mm]</span></div>
        <div class="tech-line"><span class="tech-key">Focus Element</span><span class="tech-val">[Subject]</span></div>
        <div class="tech-line"><span class="tech-key">Key Light</span><span class="tech-val">[Lighting Setup]</span></div>
      </div>
    </div>
    
    <!-- AI GENERATED IMAGE -->
    <!--
    <div class="concept-generated-img">
      <img src="images/placeholder.png" alt="Concept Image">
    </div>
    -->

    <div class="concept-prompt">
      <h5>AI Visualization Prompt — <span>[Style]</span></h5>
      <div class="prompt-text">[Paste the Midjourney prompt here to generate the visual representation of this shot.]</div>
    </div>
  </div>

</main>

<footer class="footer">
  <div>UCM·SCI © 2025 // Photoshoot Architecture</div>
  <div>Sys_Arch // v2.0</div>
</footer>

</body>
</html>
`;
    const finalFileHtml = rawTemplate.replace(/\[Project Title\]/g, title).replace(/\[Name\]/g, badge);
    
    if (generatedBlobUrl) URL.revokeObjectURL(generatedBlobUrl);
    const blob = new Blob([finalFileHtml], { type: 'text/html' });
    generatedBlobUrl = URL.createObjectURL(blob);
    
    dlBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = generatedBlobUrl;
      a.download = `${id.toLowerCase()}-shoot-brief.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    outputDiv.style.display = 'block';
  });

  copyBtn.addEventListener('click', () => {
    const code = document.getElementById('wiz-code');
    code.select();
    document.execCommand('copy');
    copyBtn.innerText = 'Copied!';
    setTimeout(() => copyBtn.innerText = 'Copy Code', 2000);
  });

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


