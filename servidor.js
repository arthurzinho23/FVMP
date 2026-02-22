import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("fvmp.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS ponto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    saida DATETIME,
    status TEXT DEFAULT 'ativo'
  );

  CREATE TABLE IF NOT EXISTS foragidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    veiculo TEXT,
    motivo TEXT,
    status TEXT DEFAULT 'procurado', -- 'procurado' or 'preso'
    data_adicao DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Bate Ponto Routes
  app.get("/api/ponto", (req, res) => {
    const records = db.prepare("SELECT * FROM ponto ORDER BY entrada DESC").all();
    res.json(records);
  });

  app.post("/api/ponto", (req, res) => {
    const { discord_id, nome, action } = req.body; // action: 'entrada' or 'saida'
    
    if (action === 'entrada') {
      const stmt = db.prepare("INSERT INTO ponto (discord_id, nome, status) VALUES (?, ?, 'ativo')");
      const info = stmt.run(discord_id, nome);
      res.json({ id: info.lastInsertRowid, status: 'success' });
    } else if (action === 'saida') {
      const stmt = db.prepare("UPDATE ponto SET saida = CURRENT_TIMESTAMP, status = 'finalizado' WHERE discord_id = ? AND status = 'ativo'");
      stmt.run(discord_id);
      res.json({ status: 'success' });
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  });

  // Foragidos Routes
  app.get("/api/foragidos", (req, res) => {
    const records = db.prepare("SELECT * FROM foragidos ORDER BY data_adicao DESC").all();
    res.json(records);
  });

  app.post("/api/foragidos", (req, res) => {
    const { nome, descricao, veiculo, motivo } = req.body;
    const stmt = db.prepare("INSERT INTO foragidos (nome, descricao, veiculo, motivo) VALUES (?, ?, ?, ?)");
    const info = stmt.run(nome, descricao, veiculo, motivo);
    res.json({ id: info.lastInsertRowid, status: 'success' });
  });

  app.patch("/api/foragidos/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const stmt = db.prepare("UPDATE foragidos SET status = ? WHERE id = ?");
    stmt.run(status, id);
    res.json({ status: 'success' });
  });

  app.delete("/api/foragidos/:id", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM foragidos WHERE id = ?");
    stmt.run(id);
    res.json({ status: 'success' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
