const express = require('express');
const fs = require('fs');
const path = require('path');
const { startStream, stopStream, getStreams, saveStreams } = require('./streamManager');

const app = express();
const PORT = 8080;
const HOST = '5.42.220.91';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/streams', (req, res) => {
  res.json(getStreams());
});

app.post('/api/streams', (req, res) => {
  const id = 'stream-1';
  const input = 'srt://0.0.0.0:5000';
  const output = 'srt://5.42.220.91:6000';
  const result = startStream(id, input, output);
  saveStreams();
  res.json(result);
});

app.delete('/api/streams/:id', (req, res) => {
  const id = req.params.id;
  const result = stopStream(id);
  saveStreams();
  res.json(result);
});

app.listen(PORT, HOST, () => {
  console.log(`✅ SRT Server running at http://${HOST}:${PORT}`);
});
