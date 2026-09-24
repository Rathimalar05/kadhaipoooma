const MOOD_LABELS = {
  warm: 'warm',
  nostalgic: 'nostalgic',
  funny: 'funny',
  bittersweet: 'bittersweet',
  hopeful: 'hopeful',
};

const board = document.getElementById('story-board');
const chips = document.querySelectorAll('.chip');
const form = document.getElementById('share-form');
const statusEl = document.getElementById('form-status');

let activeMood = 'all';

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function renderStories(stories) {
  if (!board) return;
  if (!stories.length) {
    board.innerHTML = `<div class="empty-state">No stories here yet — be the first to pin one to the wall.</div>`;
    return;
  }

  board.innerHTML = stories
    .map(
      (s) => `
      <article class="story-card" data-id="${s.id}">
        <span class="story-mood">${MOOD_LABELS[s.mood] || s.mood}</span>
        <h3>${escapeHtml(s.title)}</h3>
        <p class="body">${escapeHtml(s.story)}</p>
        <div class="story-meta">
          <span>${escapeHtml(s.name)} · ${timeAgo(s.createdAt)}</span>
          <button class="like-btn" data-id="${s.id}" aria-label="Send warmth to this story">
            &#9829; <span class="like-count">${s.likes}</span>
          </button>
        </div>
      </article>`
    )
    .join('');
}

async function loadStories() {
  if (!board) return;
  board.innerHTML = `<div class="empty-state">Gathering the stories...</div>`;
  try {
    const query = activeMood === 'all' ? '' : `?mood=${encodeURIComponent(activeMood)}`;
    const res = await fetch(`/api/stories${query}`);
    if (!res.ok) throw new Error('Failed to load');
    const stories = await res.json();
    renderStories(stories);
  } catch (err) {
    board.innerHTML = `<div class="empty-state">The wall didn't load. Refresh and try again.</div>`;
  }
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    activeMood = chip.dataset.mood;
    loadStories();
  });
});

if (board) {
  board.addEventListener('click', async (e) => {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;
    btn.disabled = true;
    try {
      const res = await fetch(`/api/stories/${btn.dataset.id}/like`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        btn.querySelector('.like-count').textContent = updated.likes;
      }
    } finally {
      btn.disabled = false;
    }
  });
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const payload = {
      name: form.name.value,
      title: form.title.value,
      story: form.story.value,
      mood: form.mood.value,
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        statusEl.textContent = data.error || 'Something went wrong. Please try again.';
        statusEl.classList.add('err');
        return;
      }

      form.reset();
      statusEl.textContent = 'Pinned to the wall. Thank you for sharing.';
      statusEl.classList.add('ok');
      activeMood = 'all';
      chips.forEach((c) => c.classList.toggle('active', c.dataset.mood === 'all'));
      loadStories();
    } catch (err) {
      statusEl.textContent = "Couldn't reach the wall. Check your connection and try again.";
      statusEl.classList.add('err');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

loadStories();
