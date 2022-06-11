require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

const mongDbUrl = process.env.MONGODB_URL;
const MongoClient = require('mongodb').MongoClient;
let db;

app.set('view engine', 'ejs');

// 0. DB Connection
MongoClient.connect(mongDbUrl, { useUnifiedTopology: true }, (에러, client) => {
  if (에러) {
    return console.log(에러);
  }

  db = client.db('todoapp');
  app.listen(8080, () => console.log('listening on 8080'));
});

// 1. Get Index.html
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// 2. Get Write page
app.get('/write', (req, res) => res.sendFile(__dirname + '/write.html'));

// 3. Get List page
app.get('/list', (req, res) => {
  db.collection('post')
    .find()
    .toArray((error, result) => {
      res.render('list.ejs', { posts: result });
    });
});

// 4. post post_idx

// 5. Post To Do
app.post('/add', (req, res) => {
  db.collection('counter').findOne({ name: '게시물 개수' }, (error, result) => {
    console.log(result.totalPost);
    let totalPost = result.totalPost;

    db.collection('post').insertOne(
      { _idx: totalPost + 1, toDo: req.body.toDo, date: req.body.date },
      () => {
        console.log('저장 완료');
        db.collection('counter').updateOne(
          { name: '게시물 개수' },
          { $inc: { totalPost: 1 } },
          (error, result) => {
            if (error) {
              return console.log(error);
            }
          }
        );
      }
    );
  });
});
