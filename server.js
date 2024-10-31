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

// 테이블 생성 쿼리 수정: name 열에 UNIQUE 제약 조건 추가
const createTableQuery = `
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    totalcount INT DEFAULT 0,
    cwin INT DEFAULT 0,
    nwin INT DEFAULT 0,
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

// initializeDatabase 함수 수정
async function initializeDatabase() {
    try {
        await pool.query('DROP TABLE IF EXISTS leaderboard'); // 기존 테이블 삭제
        await pool.query(createTableQuery); // 테이블 재생성
        console.log("leaderboard 테이블이 초기화되었습니다.");
        return { success: true, message: "Database reset successfully" };
    } catch (error) {
        console.error("데이터베이스 초기화 중 오류 발생:", error);
        return { success: false, message: "Database reset failed" };
    }
}

app.get('/resetsql', async (req, res) => {
    const result = await initializeDatabase();
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
