require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const port = process.env.PORT || 1234;
const app = express();

app.use(cors());
app.use(express.json()); // our server can accept json in body of request

// private key ask steven
const privateKey = process.env.image_jwtPrivateKey;

if (!privateKey) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  // 0 is success, anything else is failure
  process.exit(1);
}

// mongoose connection
const uri = process.env.ATLAS_URI;
mongoose.connect(uri).catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log(`MogoDB database connection established successfully`);
});

// routes
const posts = require('./routes/posts');

// .use
app.use('/api/posts', posts);

app.use('*', (req, res) => res.status(404).json({ error: 'Page not found' }));

if (process.env.NODE_ENV === 'production') {
  // Serve any static file
  app.use(express.static(path.join(_dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`upload-image-s3 app listening at http://localhost:${port}`);
});
