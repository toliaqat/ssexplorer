const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Connect to the SQLite database
const dbPath = path.resolve(__dirname, '/Users/touseefliaqat/Downloads/axelnet-state/_validator-primary-0/swingstore.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Endpoint to get all VAT options from the kvStore table
app.get('/api/vats', (req, res) => {
  const query = "SELECT * FROM kvStore WHERE key LIKE 'v%.options'";
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    const transformedRows = rows.map(row => {
      let parsedValue;
      try {
        parsedValue = JSON.parse(row.value);
      } catch (e) {
        parsedValue = row.value; // Fallback to original value if parsing fails
      }
      return {
        ...row,
        key: row.key.replace(/v\d+\.options/, match => match.replace(/\.options$/, '')),
        value: parsedValue
      };
    });
    res.json({
      message: 'success',
      data: transformedRows
    });
  });
});

// Endpoint to get all rows from the kvStore table
app.get('/api/kvstore', (req, res) => {
  const query = 'SELECT * FROM kvStore';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// Endpoint to get a list of tables in the database
app.get('/api/tables', (req, res) => {
  const query = `
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    const tables = rows.map(row => row.name);
    res.json({
      message: 'success',
      tables: tables
    });
  });
});

// Example API endpoint
app.get('/api/count', (req, res) => {
  db.all('SELECT count(*) FROM kvStore', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
