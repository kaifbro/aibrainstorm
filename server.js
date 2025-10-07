import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


console.log('PORT:', process.env.PORT);
console.log('SECRET_KEY:', process.env.SECRET_KEY);
console.log('HF_API_KEY:', process.env.HF_API_KEY);


const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'mysecretkey';
const HF_API_KEY = process.env.HF_API_KEY;

// -------------------- SQLite DB --------------------
const db = new sqlite3.Database('./brainstorm.db');

db.run(`CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY,
  text TEXT,
  columnName TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT
)`);

// -------------------- CARD ROUTES --------------------
app.get('/api/cards', (req, res) => {
  db.all('SELECT * FROM cards', [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/cards', (req, res) => {
  const { text, columnName } = req.body;
  db.run('INSERT INTO cards (text, columnName) VALUES (?, ?)', [text, columnName], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ id: this.lastID, text, columnName });
  });
});

app.put('/api/cards/:id', (req, res) => {
  const { columnName } = req.body;
  const { id } = req.params;
  db.run('UPDATE cards SET columnName = ? WHERE id = ?', [columnName, id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

app.delete('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM cards WHERE id = ?', [id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

// -------------------- AUTH ROUTES --------------------
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'User registered successfully', userId: this.lastID });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  });
});

// -------------------- HUGGING FACE AI --------------------
app.post('/api/ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || prompt.trim() === '') return res.status(400).json({ error: 'Prompt cannot be empty' });

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/distilgpt2',
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    let generated = 'No response from AI';
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      generated = response.data[0].generated_text;
    } else if (response.data.error) {
      generated = response.data.error;
    }

    res.json({ result: generated });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'AI generation failed. Check your Hugging Face API key and model.' });
  }
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
