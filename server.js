const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // Add this line to use the path module
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // Update the path to your public directory

// PostgreSQL 연결 설정 (Koyeb의 PostgreSQL URI와 맞춰 수정)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://koyeb-adm:iGo7kJE0ryOK@ep-delicate-sky-a2ob1npy.eu-central-1.pg.koyeb.app/koyebdb", // Koyeb 환경 변수 사용
    ssl: { rejectUnauthorized: false }
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

app.post('/save', async (req, res) => {
    console.log("Received data:", req.body); // 요청 데이터 로그
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
        console.error('Error saving data:', err.message);
        console.error(err.stack);
        res.status(500).send('Error saving data');
    }
});

async function initializeDatabase() {
    try {
      await client.connect();
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS leaderboard (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          totalcount INTEGER DEFAULT 0,
          cwin INTEGER DEFAULT 0,
          nwin INTEGER DEFAULT 0,
          ptime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await client.query(createTableQuery);
      console.log("leaderboard 테이블이 초기화되었습니다.");
      return { success: true, message: "Database initialized successfully" };
    } catch (error) {
      console.error("데이터베이스 초기화 중 오류 발생:", error);
      return { success: false, message: "Database initialization failed" };
    } finally {
      await client.end();
    }
  }
  
  // /resetsql 경로 라우트
  app.get('/resetsql', async (req, res) => {
    const result = await initializeDatabase();
    res.json(result);
  });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
