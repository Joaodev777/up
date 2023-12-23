const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('database.db');

// Create a table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY,
    name TEXT,
    address TEXT,
    day INTEGER,
    month TEXT,
    referenceNumber TEXT,
    printCount INTEGER DEFAULT 0
  )
`);

app.post('/insertData', (req, res) => {
  const { name, address, day, month, referenceNumber } = req.body;

  const insertQuery = `
    INSERT INTO clients (name, address, day, month, referenceNumber)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(insertQuery, [name, address, day, month, referenceNumber], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to insert data into the database' });
    }

    const clientId = this.lastID;

    // Increment printCount for the client
    db.run('UPDATE clients SET printCount = printCount + 1 WHERE id = ?', [clientId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: 'Failed to update print count in the database' });
      }

      res.json({ success: true, message: 'Data inserted and print count updated successfully' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
