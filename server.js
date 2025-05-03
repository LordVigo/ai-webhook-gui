const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Set up SQLite database
const db = new sqlite3.Database('webhookui.db');

// Create tables if they don't exist
db.serialize(() => {
  // Create tables in order of dependencies
  db.run(`CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    url TEXT,
    passphrase TEXT,
    createdAt TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chatHistories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webhookId INTEGER,
    webhookName TEXT,
    createdAt TEXT,
    FOREIGN KEY (webhookId) REFERENCES webhooks (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chatHistoryId INTEGER,
    content TEXT,
    isUser INTEGER,
    timestamp TEXT,
    data TEXT,
    FOREIGN KEY (chatHistoryId) REFERENCES chatHistories (id)
  )`);
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api', cors()); // Enable CORS for API endpoints

// API endpoints
app.get('/api/webhooks', (req, res) => {
  db.all('SELECT id, name, url, createdAt FROM webhooks', (err, webhooks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(webhooks);
  });
});

app.post('/api/webhooks', (req, res) => {
  const { name, url, passphrase } = req.body;
  
  db.get('SELECT id FROM webhooks WHERE name = ?', [name], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (existing) {
      return res.status(400).json({ error: 'A webhook with this name already exists' });
    }

    db.run(
      'INSERT INTO webhooks (name, url, passphrase, createdAt) VALUES (?, ?, ?, ?)',
      [name, url, passphrase, new Date().toISOString()],
      function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
      }
    );
  });
});

app.get('/api/webhooks/:id', (req, res) => {
  db.get('SELECT * FROM webhooks WHERE id = ?', [req.params.id], (err, webhook) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    res.json(webhook);
  });
});

app.delete('/api/webhooks/:id', (req, res) => {
  db.run('DELETE FROM webhooks WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    // Delete associated chat histories
    db.run('DELETE FROM chatHistories WHERE webhookId = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(204).send();
    });
  });
});

// Chat history endpoints
app.get('/api/chatHistories', (req, res) => {
  db.all('SELECT * FROM chatHistories ORDER BY createdAt DESC', (err, histories) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(histories);
  });
});

app.post('/api/chatHistories', (req, res) => {
  const { webhookId } = req.body;
  
  db.get('SELECT name FROM webhooks WHERE id = ?', [webhookId], (err, webhook) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    db.run(
      'INSERT INTO chatHistories (webhookId, webhookName, createdAt) VALUES (?, ?, ?)',
      [webhookId, webhook.name, new Date().toISOString()],
      function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
      }
    );
  });
});

app.delete('/api/chatHistories/:id', (req, res) => {
  db.run('DELETE FROM chatHistories WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    // Delete associated messages
    db.run('DELETE FROM messages WHERE chatHistoryId = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(204).send();
    });
  });
});

app.patch('/api/chatHistories/:id', (req, res) => {
  const { name } = req.body;
  db.run(
    'UPDATE chatHistories SET webhookName = ? WHERE id = ?',
    [name, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chat history not found' });
      }
      res.status(200).json({ id: req.params.id, webhookName: name });
    }
  );
});

// Message endpoints
app.get('/api/chatHistories/:id/messages', (req, res) => {
  db.all(
    'SELECT * FROM messages WHERE chatHistoryId = ? ORDER BY timestamp',
    [req.params.id],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Parse data field for each message
      const parsedMessages = messages.map(message => ({
        ...message,
        data: message.data ? JSON.parse(message.data) : null
      }));
      res.json(parsedMessages);
    }
  );
});

app.post('/api/messages', (req, res) => {
  const { chatHistoryId, content, isUser, timestamp, data } = req.body;
  
  // Ensure all required fields are present
  if (!chatHistoryId || content === undefined || isUser === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Convert data to string if present
  let dataString = null;
  if (data) {
    try {
      dataString = JSON.stringify(data);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
  }
  
  db.run(
    'INSERT INTO messages (chatHistoryId, content, isUser, timestamp, data) VALUES (?, ?, ?, ?, ?)',
    [chatHistoryId, content, isUser ? 1 : 0, timestamp || new Date().toISOString(), dataString],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Serve static files and handle client-side routing
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Close database connection when server stops
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log('Access URLs:');
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: http://<your-ip>:${port}`);
});
