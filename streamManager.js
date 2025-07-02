// streamManager.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const STREAMS_FILE = path.join(__dirname, 'streams.json');
let streams = {};

// Загрузка текущих потоков (если есть)
if (fs.existsSync(STREAMS_FILE)) {
  streams = JSON.parse(fs.readFileSync(STREAMS_FILE));
} else {
  streams = {};
}

function startStream(id, input, output) {
  if (streams[id]) {
    return { status: 'already running', id };
  }

  const proc = spawn('srt-live-transmit', [input, output]);

  proc.on('exit', (code) => {
    console.log(`Stream ${id} exited with code ${code}`);
    delete streams[id];
    saveStreams();
  });

  streams[id] = {
    input,
    output,
    pid: proc.pid,
    startTime: Date.now()
  };

  return { status: 'started', id, pid: proc.pid };
}

function stopStream(id) {
  const stream = streams[id];
  if (!stream) return { status: 'not found', id };

  try {
    process.kill(stream.pid);
    delete streams[id];
    return { status: 'stopped', id };
  } catch (e) {
    return { status: 'error stopping', id, error: e.message };
  }
}

function getStreams() {
  return streams;
}

function saveStreams() {
  fs.writeFileSync(STREAMS_FILE, JSON.stringify(streams, null, 2));
}

module.exports = { startStream, stopStream, getStreams, saveStreams };