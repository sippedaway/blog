const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'post.html'));
});
app.get('/api/posts', async (req, res) => {
  const apiUrl = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries?access_token=${CONTENTFUL_ACCESS_TOKEN}&content_type=post`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

app.get('/api/posts/:postId', async (req, res) => {
  const postId = req.params.postId;
  const apiUrl = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries/${postId}?access_token=${CONTENTFUL_ACCESS_TOKEN}&include=2`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ error: 'Error fetching post' });
  }
});

app.get('/api/assets/:assetId', async (req, res) => {
  const assetId = req.params.assetId;
  const apiUrl = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/assets/${assetId}?access_token=${CONTENTFUL_ACCESS_TOKEN}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching asset:', err);
    res.status(500).json({ error: 'Error fetching asset' });
  }
});

module.exports = app;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});