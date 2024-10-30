const mongoose = require('mongoose');
const scoreSchema = new mongoose.Schema({
    name: String,
    totalcount: Number,
    cwin: Number,
    nwin: Number,
    cplay: Number,
    nplay: Number,
    ptime: String
});

const Score = mongoose.model('Score', scoreSchema);


// Connect to MongoDB (replace <your_mongo_uri> with your MongoDB URI)
mongoose.connect('ep-morning-river-a136vtvj.ap-southeast-1.pg.koyeb.app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a Schema and Model for the leaderboard data
const leaderboardSchema = new mongoose.Schema({
    name: String,
    totalcount: Number
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// GET route to fetch sorted leaderboard data
app.get('/data', async (req, res) => {
    try {
        const leaderboardData = await Leaderboard.find().sort({ totalcount: -1 });
        res.json(leaderboardData);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

// POST route to save leaderboard data
app.post('/save', async (req, res) => {
    try {
        const leaderboardData = new Leaderboard(req.body);
        await leaderboardData.save();
        res.send('Data successfully saved');
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error saving data');
    }
});
