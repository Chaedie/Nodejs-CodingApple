const express = require('express');
const app = express();

// listen
app.listen(8080, function () {
  console.log('listening on 8080');
});

// get
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/write.html', function (req, res) {
  res.sendFile(__dirname + '/write.html');
});

app.get('/pet', function (req, res) {
  res.send('펫 용품 쇼핑페이지입니다.');
});

app.get('/beauty', function (req, res) {
  res.send('뷰티 용품 쇼핑페이지입니다.');
});
