const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

app.use(express.json());

// PostgreSQL 연결 설정 (Koyeb의 PostgreSQL URI와 맞춰 수정)
const pool = new Pool({
    connectionString: 'postgres://koyeb-adm:V8TYM6OkoxLS@ep-morning-river-a136vtvj.ap-southeast-1.pg.koyeb.app/koyebdb', // 실제 URI로 교체하세요
    ssl: { rejectUnauthorized: false } // SSL을 사용하는 경우 추가
});

// 테이블 생성 쿼리 실행 (처음 실행 시 한 번만 필요)
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

// GET /data - 데이터 가져오기
app.get('/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM leaderboard ORDER BY totalcount DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

// POST /save - 데이터 저장 및 업데이트
app.post('/save', async (req, res) => {
    const { name, totalcount, cwin, nwin, cplay, nplay } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM leaderboard WHERE name = $1',
            [name]
        );

        if (result.rows.length > 0) {
            // 기존 데이터가 있는 경우 업데이트
            await pool.query(
                'UPDATE leaderboard SET totalcount = totalcount + 1, cwin = cwin + $1, nwin = nwin + $2, cplay = cplay + $3, nplay = nplay + $4, ptime = NOW() WHERE name = $5',
                [cwin, nwin, cplay, nplay, name]
            );
        } else {
            // 새로운 사용자 데이터 추가
            await pool.query(
                'INSERT INTO leaderboard (name, totalcount, cwin, nwin, cplay, nplay, ptime) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                [name, totalcount, cwin, nwin, cplay, nplay]
            );
        }

        res.send('Data successfully saved');
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error saving data');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
