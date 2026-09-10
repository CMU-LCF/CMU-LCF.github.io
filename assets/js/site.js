document.addEventListener('DOMContentLoaded', async () => {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const homePublications = document.getElementById('home-publications');
  if (homePublications) {
    const pubs = await loadJson('data/publications.json');
    const selected = pubs.filter((pub) => pub.selected).slice(0, 4);
    homePublications.innerHTML = selected.map(renderPublicationShort).join('');
  }

  const publicationList = document.getElementById('publication-list');
  if (publicationList) {
    const pubs = await loadJson('data/publications.json');
    renderPublicationPage(pubs, publicationList);
  }

  const membersGrid = document.getElementById('members-grid');
  const membersDirector = document.getElementById('members-director');
  if (membersGrid) {
    const members = await loadJson('data/members.json');
    const director = members.find((member) => member.category === 'faculty');
    const students = members.filter((member) => member.category !== 'faculty');
    if (membersDirector && director) {
      membersDirector.innerHTML = renderDirectorCard(director);
    }
    membersGrid.innerHTML = students.map((member) => (member.bio ? renderDirectorCard(member) : renderMemberCard(member))).join('');
  }

  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    const projects = await loadJson('data/projects.json');
    projectsGrid.innerHTML = projects.map(renderProjectCard).join('');
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const status = document.getElementById('contact-form-status');
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = contactForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      status.textContent = 'Sending…';
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          contactForm.reset();
          status.textContent = 'Thanks — your message has been sent.';
        } else {
          status.textContent = 'Something went wrong. Please email ryjoh@cmu.edu directly.';
        }
      } catch (error) {
        status.textContent = 'Something went wrong. Please email ryjoh@cmu.edu directly.';
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  const tagContainer = document.getElementById('publication-tags');
  if (tagContainer) {
    const pubs = await loadJson('data/publications.json');
    const tags = ['all', ...new Set(pubs.flatMap((pub) => pub.tags || []))];
    tagContainer.innerHTML = tags.map(renderTag).join('');

    tagContainer.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tag]');
      if (!button) return;
      const tag = button.dataset.tag;
      document.querySelectorAll('.tag').forEach((el) => el.classList.toggle('active', el.dataset.tag === tag));
      const list = document.getElementById('publication-list');
      const pubData = pubs;
      const filtered = tag === 'all' ? pubData : pubData.filter((pub) => (pub.tags || []).includes(tag));
      renderPublicationPage(filtered, list);
    });
  }

  const searchInput = document.getElementById('publication-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const currentTag = document.querySelector('.tag.active')?.dataset.tag || 'all';
      const list = document.getElementById('publication-list');
      const pubs = loadCachedPublications();
      const q = searchInput.value.trim().toLowerCase();
      const filtered = pubs.filter((pub) => {
        const matchesTag = currentTag === 'all' || (pub.tags || []).includes(currentTag);
        const haystack = `${pub.title} ${pub.authors.join(' ')} ${pub.venue}`.toLowerCase();
        const matchesQuery = !q || haystack.includes(q);
        return matchesTag && matchesQuery;
      });
      renderPublicationPage(filtered, list);
    });
  }
});

let cachedPublications = null;

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch ' + path);
  const data = await response.json();
  cachedPublications = data;
  return data;
}

function loadCachedPublications() {
  return cachedPublications || [];
}

function renderPublicationShort(pub) {
  return `
    <article class="publication-item ${pub.selected ? 'is-selected' : ''}">
      <h3>${pub.title}</h3>
      <div class="publication-meta">${pub.authors.join(', ')} · ${pub.venue} · ${pub.year}</div>
      <div class="publication-links">
        ${pub.pdf ? `<a href="${pub.pdf}" target="_blank" rel="noreferrer">PDF</a>` : ''}
        ${pub.doi ? `<a href="${pub.doi}" target="_blank" rel="noreferrer">DOI</a>` : ''}
      </div>
    </article>
  `;
}

function renderPublicationPage(items, node) {
  if (!node) return;
  node.innerHTML = items.length ? items.map(renderPublicationItem).join('') : '<p>No publications match the current filters.</p>';
}

function renderPublicationItem(pub) {
  const authors = pub.authors.map((author) => author.includes('R. F. Johnson') || author.includes('Ryan F. Johnson') || author.includes('Ryan Frederick Johnson') ? `<strong>${author}</strong>` : author).join(', ');
  return `
    <article class="publication-item ${pub.selected ? 'is-selected' : ''}">
      <h3>${pub.title}</h3>
      <div class="publication-meta">${authors} · ${pub.venue} · ${pub.year}</div>
      <div class="publication-links">
        ${pub.pdf ? `<a href="${pub.pdf}" target="_blank" rel="noreferrer">PDF</a>` : ''}
        ${pub.doi ? `<a href="${pub.doi}" target="_blank" rel="noreferrer">DOI</a>` : ''}
        ${pub.code ? `<a href="${pub.code}" target="_blank" rel="noreferrer">Code</a>` : ''}
        ${pub.needs_verification ? '<span>Needs verification</span>' : ''}
      </div>
    </article>
  `;
}

function renderTag(tag) {
  const isAll = tag === 'all';
  return `<button class="tag ${isAll ? 'active' : ''}" data-tag="${tag}">${isAll ? 'All' : tag.replace(/-/g, ' ')}</button>`;
}

const LINK_LABELS = {
  email: 'Email',
  contact: 'Contact',
  googleScholar: 'Google Scholar',
};

function renderLinks(links) {
  return Object.entries(links || {}).map(([key, value]) => {
    if (!value) return '';
    const href = key === 'email' ? `mailto:${value}` : value;
    const label = LINK_LABELS[key] || key;
    const isInternal = key === 'contact';
    return isInternal
      ? `<a href="${href}">${label}</a>`
      : `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`;
  }).join('');
}

function renderCoAdvisor(member) {
  if (!member.coAdvisor) return '';
  const { name, url } = member.coAdvisor;
  return `<p>Co-advisor: <a href="${url}" target="_blank" rel="noreferrer">${name}</a></p>`;
}

function renderMemberCard(member) {
  const photo = member.photo || 'assets/people/placeholder.svg';
  return `
    <article class="member-card">
      <img src="${photo}" alt="${member.name}" />
      <h3>${member.name}</h3>
      <p>${member.role}</p>
      ${member.title ? `<p>${member.title}</p>` : ''}
      <p>${member.affiliation}</p>
      ${renderCoAdvisor(member)}
      <div class="publication-links">${renderLinks(member.links)}</div>
    </article>
  `;
}

function renderBioList(title, items) {
  if (!items || !items.length) return '';
  return `
    <h4 class="bio-list-title">${title}</h4>
    <ul class="bio-list">
      ${items.map((item) => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

function renderDirectorCard(member) {
  const photo = member.photo || 'assets/people/placeholder.svg';
  const bio = Array.isArray(member.bio) ? member.bio : (member.bio ? [member.bio] : []);
  const photoPosition = member.photoPosition || 'center';
  return `
    <article class="director-card">
      <img src="${photo}" alt="${member.name}" style="object-position: ${photoPosition};" />
      <div class="director-copy">
        <h2>${member.name}</h2>
        <p class="person-role">${member.title ? `${member.role} · ${member.title}` : member.role}</p>
        <p>${member.affiliation}</p>
        ${renderCoAdvisor(member)}
        ${bio.map((paragraph) => `<p class="director-bio">${paragraph}</p>`).join('')}
        ${renderBioList('Education', member.education)}
        ${renderBioList('Research Interests', member.researchInterests)}
        <div class="publication-links">${renderLinks(member.links)}</div>
      </div>
    </article>
  `;
}

function renderProjectCard(project) {
  return `
    <article class="project-card">
      ${project.image ? `<img src="${project.image}" alt="${project.title}" />` : ''}
      <span class="status">${project.status}</span>
      <h3>${project.title}</h3>
      <p>${project.summary}</p>
      <div class="publication-links">
        <a href="${project.links.research}">Research</a>
        <a href="contact.html">Join us</a>
      </div>
    </article>
  `;
}
