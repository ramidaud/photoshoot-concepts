const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove Internal Resources Section
const internalSectionStart = html.indexOf('<div class="category-section" id="section-internal"');
const internalSectionEnd = html.indexOf('</div>\n  </div>', internalSectionStart) + 14;
if (internalSectionStart > -1) {
  html = html.substring(0, internalSectionStart) + html.substring(internalSectionEnd);
}

// 2. Add FAB and Modal HTML before </main>
const modalHtml = `
  <!-- INITIALIZE SHOOT WIZARD -->
  <button id="fab-init-shoot" class="fab" title="Initialize New Shoot">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </button>

  <div id="modal-overlay" class="modal-overlay">
    <div class="modal-content">
      <button id="modal-close" class="modal-close">&times;</button>
      <h2 style="margin-bottom: 8px; font-family: var(--font-display); color: var(--green); text-transform: uppercase; letter-spacing: 0.1em; font-size: 16px;">Initialize New Shoot</h2>
      <p style="color: var(--muted); margin-bottom: 24px; font-size: 13px;">Scaffold a new project brief and generate dashboard HTML.</p>
      
      <div class="form-group">
        <label>Folder / Directory Name</label>
        <input type="text" id="wiz-id" placeholder="e.g. SpaceShoot (no spaces)">
      </div>
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" id="wiz-title" placeholder="e.g. THE GRAVITY WELL">
      </div>
      <div class="form-group">
        <label>Category (Dashboard Section)</label>
        <select id="wiz-category">
          <option value="field-notes">Field Notes</option>
          <option value="lab-spotlights">Lab Spotlights</option>
          <option value="faculty-profiles">Faculty Profiles</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tagline / Details</label>
        <input type="text" id="wiz-tagline" placeholder="e.g. 4 Shot Concepts • Physics Dept">
      </div>
      <div class="form-group">
        <label>Badge Title (Scientific Domain)</label>
        <input type="text" id="wiz-badge" placeholder="e.g. Astrophysics">
      </div>
      
      <button id="wiz-generate" class="wiz-btn">Generate Project Assets</button>

      <div id="wiz-output" style="display:none; margin-top: 24px;">
        <hr style="border:0; border-top: 1px solid var(--border2); margin-bottom: 24px;">
        <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--text);">1. Download Pre-filled Brief</h3>
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 12px;">Create a folder named <strong><span id="out-folder"></span></strong> and place this file inside it.</p>
        <button id="wiz-download" class="wiz-btn" style="background: transparent; border: 1px solid var(--blue); color: var(--blue);">Download shoot-brief.html</button>

        <h3 style="font-size: 14px; margin-top: 24px; margin-bottom: 12px; color: var(--text);">2. Dashboard Card Code</h3>
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 12px;">Copy this code and paste it inside the <code>index.html</code> file, directly under the <code>&lt;div class="research-grid"&gt;</code> for the category you selected.</p>
        <div style="position: relative;">
          <textarea id="wiz-code" readonly style="width: 100%; height: 150px; background: var(--bg); color: var(--text); font-family: monospace; font-size: 11px; padding: 12px; border: 1px solid var(--border2); border-radius: 4px; resize: vertical;"></textarea>
          <button id="wiz-copy" style="position: absolute; top: 8px; right: 8px; background: var(--surface2); color: var(--text); border: 1px solid var(--border2); padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">Copy Code</button>
        </div>
      </div>
    </div>
  </div>
`;
html = html.replace('</main>', modalHtml + '\n</main>');

// 3. Add CSS
const cssHtml = `
/* ── INITIALIZE SHOOT WIZARD ── */
.fab {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--green);
  color: #000;
  border: none;
  box-shadow: 0 4px 20px var(--green-glow);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s;
}
.fab:hover {
  transform: scale(1.1) translateY(-4px);
  box-shadow: 0 8px 30px var(--green-glow);
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
.modal-overlay.active {
  opacity: 1;
  pointer-events: all;
}
.modal-content {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  position: relative;
  transform: translateY(20px) scale(0.95);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: var(--glass-shadow);
  max-height: 90vh;
  overflow-y: auto;
}
.modal-overlay.active .modal-content {
  transform: translateY(0) scale(1);
}
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 24px;
  cursor: pointer;
}
.modal-close:hover { color: #fff; }
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 6px;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.form-group input, .form-group select {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border2);
  color: #fff;
  padding: 10px 12px;
  border-radius: 6px;
  font-family: var(--font-sans);
  font-size: 14px;
}
.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: var(--green);
}
.wiz-btn {
  width: 100%;
  background: var(--green);
  color: #000;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s;
}
.wiz-btn:hover { opacity: 0.9; }
`;
html = html.replace('</style>', cssHtml + '\n</style>');

// 4. Read template content and escape it for JS literal
const templateRaw = fs.readFileSync('_templates/empty_brief.html', 'utf8');
const templateEscaped = templateRaw.replace(/\`/g, '\\`').replace(/\$/g, '\\$');

// 5. Add JS logic
const jsHtml = `
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
    const cardHtml = \`
    <!-- \${id.toUpperCase()} PROJECT CARD -->
    <a href="\${id}/\${id.toLowerCase()}-shoot-brief.html" id="card-\${id.toLowerCase()}" class="concept-card project-card hero">
      <div class="concept-generated-img" style="height: 250px; background: rgba(0,0,0,0.5);">
         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" style="margin: auto; display:block; padding-top: 100px;">
           <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
           <circle cx="8.5" cy="8.5" r="1.5"></circle>
           <polyline points="21 15 16 10 5 21"></polyline>
         </svg>
      </div>
      <div class="concept-meta">
        <div class="concept-type-badge">\${badge}</div>
        <h3 class="concept-title">\${title}</h3>
        <p class="concept-tagline">\${tagline}</p>
        <div class="status-indicator">
          <div class="dot"></div>
          <span>Standby</span>
        </div>
      </div>
    </a>\`;
    
    document.getElementById('wiz-code').value = cardHtml;
    document.getElementById('out-folder').innerText = id;
    
    // 2. Generate Brief File (Blob)
    const rawTemplate = \`${templateEscaped}\`;
    const finalFileHtml = rawTemplate.replace(/\\[Project Title\\]/g, title).replace(/\\[Name\\]/g, badge);
    
    if (generatedBlobUrl) URL.revokeObjectURL(generatedBlobUrl);
    const blob = new Blob([finalFileHtml], { type: 'text/html' });
    generatedBlobUrl = URL.createObjectURL(blob);
    
    dlBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = generatedBlobUrl;
      a.download = \`\${id.toLowerCase()}-shoot-brief.html\`;
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
`;
html = html.replace('// Cinematic Scroll', jsHtml + '\n  // Cinematic Scroll');

fs.writeFileSync('index.html', html);
console.log('Successfully injected Wizard into index.html');
