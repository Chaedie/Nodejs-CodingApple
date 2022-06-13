require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static('public'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

const mongDbUrl = process.env.MONGODB_URL;
const MongoClient = require('mongodb').MongoClient;
let db;

// 0. DB Connection
MongoClient.connect(mongDbUrl, { useUnifiedTopology: true }, (에러, client) => {
  if (에러) {
    return console.log(에러);
  }

  db = client.db('todoapp');
  app.listen(8080, () => console.log('listening on 8080'));
});

// 1. Get Page
// 1.1. Get Index.html
app.get('/', (req, res) => res.render('index.ejs'));

// 1.2. Get Write page
app.get('');
app.get('/write', (req, res) => res.render('write.ejs'));

// 1.3. Get List page
app.get('/list', (req, res) => {
  db.collection('post')
    .find()
    .toArray((error, result) => {
      res.render('list.ejs', { posts: result });
    });
});

// 1.4. Get Detail pages
app.get('/detail/:id', function (req, res) {
  db.collection('post').findOne({ _idx: parseInt(req.params.id) }, (error, result) => {
    console.log(result);
    res.render('detail.ejs', { data: result });
  });
});

// 1.5. Get Edit page
app.get('/edit/:id', (req, res) => {
  db.collection('post').findOne({ _idx: parseInt(req.params.id) }, (error, result) => {
    console.log(result);
    res.render('edit.ejs', { post: result });
  });
});

// 2. Post
// 2.1. post post_idx

// 2.2 Post To Do
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

// 3.Put
// 3.1. Put post
app.put('/edit', (req, res) => {
  db.collection('post').updateOne(
    { _idx: parseInt(req.body.id) },
    { $set: { toDO: req.body.toDo, date: req.body.date } },
    (error, result) => {
      console.log('수정완료');
      res.redirect('/list');
    }
  );
});

// 5. Delete
// 5.1. Delete post
app.delete('/delete', function (req, res) {
  console.log(req.body);
  req.body._idx = parseInt(req.body._idx);
  db.collection('post').deleteOne(req.body, function (error, result) {
    console.log('삭제완료');
    res.status(200).send({ message: '성공했습니다.' });
  });
});
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/fail',
  }),
  (req, res) => {
    res.redirect('/');
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: 'id',
      passwordField: 'pw',
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      //console.log(입력한아이디, 입력한비번);
      db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) {
          return done(에러);
        }
        if (!결과) {
          return done(null, false, { message: '존재하지않는 아이디요' });
        }
        if (입력한비번 == 결과.pw) {
          return done(null, 결과);
        } else {
          return done(null, false, { message: '비번틀렸어요' });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.collection('login').findOne({ id: id }, (error, result) => {
    done(null, result);
  });
});

app.get('/mypage', hasLogin, (req, res) => {
  res.render('mypage.ejs', { 사용자: req.user });
});

function hasLogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send('로그인안하셧는데요?');
  }
}
