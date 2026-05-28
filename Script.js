const form = document.querySelector('#searchForm');
const input = document.querySelector('#searchInput');
const results = document.querySelector('#results');
const statusMessage = document.querySelector('#statusMessage');
const clearBtn = document.querySelector('#clearBtn');
const title = document.querySelector('#results-title');

const endpoint = 'https://api.tvmaze.com/search/shows?q=';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = input.value.trim();

  if (!query) {
    showStatus('Please enter a TV show name.', true);
    input.focus();
    return;
  }

  await searchShows(query);
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  results.innerHTML = '';
  title.textContent = 'Search results';
  showStatus('Search for a show to begin.');
  input.focus();
});

async function searchShows(query) {
  showStatus(`Searching for "${query}"...`);
  results.innerHTML = '';
  title.textContent = `Results for "${query}"`;

  try {
    const response = await fetch(`${endpoint}${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      showStatus('No shows were found. Try a different search term.');
      return;
    }

    showStatus(`${data.length} result${data.length === 1 ? '' : 's'} found.`);
    renderShows(data);
  } catch (error) {
    console.error(error);
    showStatus('Sorry, the TV data could not be loaded. Please check your connection and try again.', true);
  }
}

function renderShows(items) {
  const cards = items.map(({ show }) => {
    const image = show.image?.medium || 'https://placehold.co/420x590?text=No+Image';
    const summary = stripHtml(show.summary) || 'No summary is available for this show.';
    const genres = show.genres.length ? show.genres.join(', ') : 'Genre not listed';
    const rating = show.rating?.average ? `${show.rating.average}/10` : 'No rating';
    const premiered = show.premiered || 'Unknown premiere date';
    const officialSite = show.officialSite || show.url;

    return `
      <article class="show-card">
        <img src="${image}" alt="Poster for ${escapeHtml(show.name)}" loading="lazy" />
        <div class="card-body">
          <h3>${escapeHtml(show.name)}</h3>
          <div class="meta" aria-label="Show information">
            <span>${escapeHtml(show.status || 'Unknown status')}</span>
            <span>${escapeHtml(rating)}</span>
            <span>${escapeHtml(premiered)}</span>
          </div>
          <p><strong>Genres:</strong> ${escapeHtml(genres)}</p>
          <p class="summary">${escapeHtml(summary)}</p>
          <a class="card-link" href="${officialSite}" target="_blank" rel="noopener noreferrer">View more information</a>
        </div>
      </article>
    `;
  }).join('');

  results.innerHTML = cards;
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
}

function stripHtml(html) {
  const element = document.createElement('div');
  element.innerHTML = html || '';
  return element.textContent || element.innerText || '';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
