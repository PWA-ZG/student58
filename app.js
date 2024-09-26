const express = require('express');
const app = express();
var path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const https = require('https');
const fs = require('fs');

dotenv.config();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const config = {
    baseURL: externalUrl || `http://localhost:${port}`
};


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));

const homeRouter = require('./routes/home.routes');
const syncRouter = require('./routes/sync.routes');
app.use('/', homeRouter);
app.use('/saveTask', syncRouter);





// Umjesto baze podataka, pretplate se čuvaju u datoteci: 

let subscriptions = [];
const SUBS_FILENAME = './public/subscriptions.json';

if (fs.existsSync(SUBS_FILENAME)) {
    try {
        subscriptions = JSON.parse(fs.readFileSync(SUBS_FILENAME));
    } catch (error) {
        console.error(error);
    }
} else {
    fs.writeFileSync(SUBS_FILENAME, '[]', 'utf-8');
}

app.use(express.json());

app.post("/saveSubscription", function(req, res) {
    console.log(req.body);
    let sub = req.body.sub;
    
    subscriptions.push(sub);

    fs.writeFileSync(SUBS_FILENAME, JSON.stringify(subscriptions, null, 2), 'utf-8');

    res.json({
        success: true
    });
});










if (externalUrl) {
  const hostname = '0.0.0.0';
  app.listen(port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${port} and from outside on ${externalUrl}`);
  });
}else{
  
  http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
  });
  
  /*
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')}, app)
    .listen(port, function () {
      console.log(`Server running at https://localhost:${port}`);
  });
  */

  
}


