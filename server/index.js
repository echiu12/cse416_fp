const express = require('express');
const cookieParser = require('cookie-parser');
const router = require('./routes/router')
const db = require('./db');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api', router);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
