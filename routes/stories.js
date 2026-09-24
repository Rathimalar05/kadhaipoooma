const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'stories.json');

// Simple write queue so concurrent requests don't clobber the JSON file
let writeChain = Promise.resolve();
function withWriteLock(task) {
  const next = writeChain.then(task, task);
  writeChain = next.catch(() => {});
  return next;
}

async function readStories() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function saveStories(stories) {
  await fs.writeFile(DATA_FILE, JSON.stringify(stories, null, 2), 'utf-8');
}

const MOODS = new Set(['warm', 'nostalgic', 'funny', 'bittersweet', 'hopeful']);

function sanitize(text, max) {
  return String(text || '').trim().slice(0, max);
}

// GET /api/stories?mood=warm&sort=newest
router.get('/', async (req, res, next) => {
  try {
    const stories = await readStories();
    let result = [...stories];

    if (req.query.mood && MOODS.has(req.query.mood)) {
      result = result.filter((s) => s.mood === req.query.mood);
    }

    result.sort((a, b) => {
      if (req.query.sort === 'loved') return b.likes - a.likes;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/stories
router.post('/', async (req, res, next) => {
  try {
    const name = sanitize(req.body.name, 60) || 'Someone at the next table';
    const title = sanitize(req.body.title, 80);
    const story = sanitize(req.body.story, 2000);
    const mood = MOODS.has(req.body.mood) ? req.body.mood : 'warm';

    if (!title || story.length < 20) {
      return res.status(400).json({
        error: 'A story needs a title and at least a few sentences to share.',
      });
    }

    const newStory = {
      id: crypto.randomUUID(),
      name,
      title,
      story,
      mood,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    await withWriteLock(async () => {
      const stories = await readStories();
      stories.push(newStory);
      await saveStories(stories);
    });

    res.status(201).json(newStory);
  } catch (err) {
    next(err);
  }
});

// POST /api/stories/:id/like
router.post('/:id/like', async (req, res, next) => {
  try {
    let updated = null;
    await withWriteLock(async () => {
      const stories = await readStories();
      const target = stories.find((s) => s.id === req.params.id);
      if (target) {
        target.likes += 1;
        updated = target;
        await saveStories(stories);
      }
    });

    if (!updated) {
      return res.status(404).json({ error: 'That story could not be found.' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
