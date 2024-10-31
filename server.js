const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://koyeb-adm:iGo7kJE0ryOK@ep-delicate-sky-a2ob1npy.eu-central-1.pg.koyeb.app/koyebdb",
    ssl: { rejectUnauthorized: false }
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    totalcount INT DEFAULT 0,
    cwin INT DEFAULT 0,
    nwin INT DEFAULT 0,
    cplay INT DEFAULT 0,
    nplay INT DEFAULT 0,
    ptime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pool.query(createTableQuery)
    .then(() => console.log("Leaderboard table is ready"))
    .catch(err => console.error("Error creating table:", err));

app.get('/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM leaderboard ORDER BY totalcount DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

app.put('/save', async (req, res) => {
    const { name, totalcount, cwin, nwin, ptime } = req.body;
    const updateQuery = `
        INSERT INTO leaderboard (name, totalcount, cwin, nwin, ptime)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name)
        DO UPDATE SET 
            totalcount = EXCLUDED.totalcount,
            cwin = EXCLUDED.cwin,
            nwin = EXCLUDED.nwin,
            ptime = EXCLUDED.ptime
    `;
    try {
        await pool.query(updateQuery, [name, totalcount, cwin, nwin, ptime]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Data update error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

async function initializeDatabase() {
    const initQuery = `
    CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        totalcount INTEGER DEFAULT 0,
        cwin INTEGER DEFAULT 0,
        nwin INTEGER DEFAULT 0,
        ptime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    try {
        await pool.query(initQuery);
        console.log("Leaderboard table initialized successfully");
        return { success: true, message: "Database initialized successfully" };
    } catch (error) {
        console.error("Database initialization error:", error);
        return { success: false, message: "Database initialization failed" };
    }
}

app.get('/resetsql', async (req, res) => {
    const result = await initializeDatabase();
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
