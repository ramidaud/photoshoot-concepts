const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Extract all cards
const cardRegex = /<!-- ([A-Z]+) PROJECT CARD -->[\s\S]*?<\/a>/g;
const cards = {};
let match;
while ((match = cardRegex.exec(html)) !== null) {
  cards[match[1].toLowerCase()] = match[0];
}

const sections = {
  field_notes: {
    title: 'Field Notes',
    subtitle: 'Documentary & Expeditions',
    ids: ['eren', 'joshuacache', 'costello']
  },
  lab_spotlights: {
    title: 'Lab Spotlights',
    subtitle: 'Tech & Innovation',
    ids: ['biofilm', 'prosthetics', 'liquidcrystal']
  },
  faculty_profiles: {
    title: 'Faculty Profiles',
    subtitle: 'Conceptual Portraiture',
    ids: ['caldwell', 'gunstad', 'dexheimer', 'rasinski', 'adams']
  },
  internal: {
    title: 'Internal Resources',
    subtitle: 'Templates & Architecture',
    ids: ['placeholder'] // It's named <!-- PLACEHOLDER PROJECT CARD -->
  }
};

let newGridHtml = '';
let sectionNum = 1;

for (const [key, section] of Object.entries(sections)) {
  newGridHtml += `
  <div class="category-section" id="section-${key}" style="margin-bottom: 80px;">
    <div class="section-label" style="margin-bottom: 24px;">
      <div class="section-num">0${sectionNum++}</div>
      <h2 style="display:flex; align-items:baseline; gap:16px;">${section.title} <span style="opacity:0.5; font-size:12px; font-weight:normal; letter-spacing:0.1em; text-transform:uppercase;">${section.subtitle}</span></h2>
    </div>
    <div class="research-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
`;
  for (const id of section.ids) {
    if (cards[id]) {
      newGridHtml += cards[id] + '\n\n';
    } else {
      console.log('Missing card:', id);
    }
  }
  newGridHtml += `    </div>\n  </div>\n`;
}

// Replace the old grid
const startMarker = '<div class="research-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">';
const endMarker = '</main>';

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newHtml = html.substring(0, startIndex) + newGridHtml + html.substring(endIndex);
  
  // Update the section label at the top from "Active Photoshoots" to just search container
  const oldHeader = `<div class="section-label">
    <div class="section-num">01</div>
    <h2>Active Photoshoots</h2>
  </div>`;
  const modifiedHtml = newHtml.replace(oldHeader, '');

  fs.writeFileSync('index.html', modifiedHtml);
  console.log('Successfully reorganized index.html');
} else {
  console.log('Could not find grid boundaries');
}
