const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const {connectToMongoDB} = require('./connect');
const {restrictToLoggedinUserOnly, checkAuth} = require('./middlewares/auth');
const URL = require('./models/url');

const urlRoute = require('./routes/routes_url');
const staticRouter = require('./routes/staticRouter')
const userRoute = require('./routes/routes_user')

const app = express();
const PORT = 8001;

connectToMongoDB('mongodb://localhost:27017/short-url').then(() => 
    console.log('MongoDB connected')
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use('/', checkAuth, staticRouter);

app.get('/url/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId
        }, 
        { 
            $push: {
                visitHistory: { timestamp: Date.now() },
            }
        }
    );
    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`))