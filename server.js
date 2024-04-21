const express = require('express');
const bodyParser = require('body-parser');

const { connectPostgres } = require('./datasources/postgres');
const bookRouter = require('./routes/book');

const app = express();

const PORT = 3001;

app.use(bodyParser.json());

app.listen(PORT, async () => {
    try {
        await connectPostgres();
        global.appStartTime = new Date();

        console.log(`Server is up on PORT ${PORT}`);
    } catch(error) {
        console.log('Error occured while starting the server', error);
    }
})

app.get('/', async (req, res) => {
    res.json({
        started: global.appStartTime,
        upTime: (new Date()).getTime() - global.appStartTime,
    })
});

app.use('/book', bookRouter);
