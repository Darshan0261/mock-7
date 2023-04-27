const express = require('express');
const cors = require('cors')
require('dotenv').config()
const { connection } = require('./configs/db');
const {userRouter} = require('./routes/Users.router')
const app = express();

app.use(cors({
    origin: "*"
}))
app.use(express.json());

app.use('/users', userRouter)

app.get('/', (req, res) => {
    res.send('Base API Endpoint')
})

app.get('/oauth/github/callback', (req, res) => {
    console.log(req)
    res.send('Oatih Complete')
})

app.listen(process.env.PORT, async () => {
    try {
        await connection;
        console.log('Connected to DB');
    } catch (error) {
        console.log(error);
        console.log('Cannot connect to DB')
    }
    console.log(`Server is running on port ${process.env.PORT}`)
})