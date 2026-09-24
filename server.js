const express = require('express');
const path = require('path');
const storiesRouter = require('./routes/stories');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '4mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/stories', storiesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Kadhaipooma is brewing at http://localhost:${PORT}`);
});
