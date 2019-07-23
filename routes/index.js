var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

const jwt = require('jsonwebtoken');

const request = require('request')

/* POST validate user token (Web Server -> this) */
router.post('/guid/validation', function(req, res, next) {
  var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '8973',
    database: 'nc_qr_auth'
  });
  connection.connect(function (err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
  });

  const request = {
    guid: req.body.uuid
  }

  connection.query('select * from user where guid=?', [request.guid], function (err, rows) {
    if (err) {
        console.log("select * from user where guid=?")
        console.error(err);
        throw err;
    }
    connection.end();

    if (rows.length) {
      res.json({
        result: 1,
        message: "디바이스 인증 성공!"
      });
    }
    else{
      res.json({
        result: 0,
        message: "디바이스 인증 실패.."
      });
    }
  });
});

/* POST validate user token (Web Server -> this) */
router.post('/user-token/validation', function(req, res, next) {
    const request = {
      user_token: req.body.user_token
    }
    const secret = req.app.get('jwt-secret');

    if(request.user_token){
      try {
        const decoded = jwt.verify(request.user_token, secret);
        console.log("/user-token/validation (POST) : token is verify");
        console.log(decoded);
        res.json({
          result: 1,
          id: decoded.id,
          name: decoded.name,
          message: "token is verify"
        });
      } catch(err) {
        console.log("/user-token/validation (POST) : token is not verify");
        res.json({
          result: 0,
          message: "토큰이 만료되었습니다.\n다시 로그인해주세요!"
        });
      }
    } else {
      console.log("/user-token/validation (POST) : no token");
      res.json({
        result: 0,
        message: "로그인 정보가 존재하지 않습니다."
      });
    }
});

/* POST login (Web Server -> this) */
router.post('/login', function(req, res, next) {
  // DATABASE SETTING
  var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '8973',
    database: 'nc_qr_auth'
  });

  connection.connect(function (err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
  });

  const secret = req.app.get('jwt-secret');

  var user = {
    'id': req.body.id,
    'password': req.body.password
  };

  connection.query('select * from user where id=?', [user.id], function (err, rows) {
    if (err) {
        console.error(err);
        throw err;
    }
    
    if (rows.length) {
      const userInfo = {
        id: rows[0].id,
        name: rows[0].name
      }

      const tokenGenerator = (userInfo, callback) => {
        const token = jwt.sign(
          userInfo, 
          secret, 
          {
            algorithm: 'HS512',
            // expiresIn: 60 * 60 * 24 * 7
            expiresIn: '24h' // 30초, 1m:1분
          }
        )
        callback(token)
      }

      tokenGenerator(userInfo, function(user_token){
        if (bcrypt.compareSync(user.password, rows[0].password)) {
          res.json({
            result: 1,
            user_token: user_token
          });
        }
        else {
          res.json({
            result: 0,
            message: "아이디 또는 비밀번호가 맞지 않습니다."
          });
        }
      });
    }
    else {
      res.json({
        result: 0,
        message: "아이디 또는 비밀번호가 맞지 않습니다."
      });
    }
    connection.end();
  });
});

/* POST join (Web Server -> this) */
router.post('/join', function(req, res, next) {
  // DATABASE SETTING
  var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '8973',
    database: 'nc_qr_auth'
  });

  connection.connect(function (err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
  });

  var user = {
    'id': req.body.id,
    'password': req.body.password,
    'name': req.body.name
  };

  connection.query('select * from user where id=?', [user.id], function (err, rows) {
      if (err) {
          console.error(err);
          throw err;
      }
      if (rows.length) {
        res.json({
          result: 0,
          message: "이미 존재하는 아이디입니다."
        });
      }
      else {
        const salt = bcrypt.genSaltSync(10); // salt값 생성, 10이 default
        const hash = bcrypt.hashSync(user.password, salt); // Digest
        user.password = hash;
        
        connection.query('insert into user set ?', user, function (err, rows) {
          if (err) {
            console.error(err);
            throw err;
          }
          connection.end();
          res.json({
            result: 1,
            message: "회원가입 성공"
          });
        });
      }
  });
});

/* GET User Info */
router.get('/users/:user_id', function(req, res, next) {
  
  res.json({
    result: 1,
    message: "회원가입 성공"
  });
});

/* GET QR-Code */
router.get('/qrcode', function(req, res, next) {
  request.get({
    headers: {'content-type': 'application/json'},
    url: 'http://172.19.144.253:3000/qrcode',
    json: true
  }, function(error, response, body){
    console.log("=============body=============");
    console.log(body);
    console.log("==============================");

    if(body.result==1){
      console.log("/qrcode (GET) : success create qr_token");
      
      res.json({
        result: 1,
        qrcode: body.qrcode,
        massage: 'QR코드 발급 성공'
      });
    }
    else{
      console.log("/qrcode (GET) : fail create qr_token");
      res.json({
        result: 0,
        massage: 'QR코드 발급 실패'
      });
    }
  });
});

/* POST qrcode-auth (Mobile App -> this) */
router.post('/qrcode-auth', function(req, res, next) {
  var user_token = {
    user_token: req.body.user_token
  };
  var qr_token = {
    qr_token: req.body.qr_token
  }
  request.post({
    headers: {'content-type': 'application/json'},
    url: 'http://172.19.144.253:3000/qrcode-token/validation',
    body: qr_token,
    json: true
  }, function(error, response, body){
    console.log(body);
    
    if(body.result==0)
      res.json({result: 0});
    else{
      request.post({
        headers: {'content-type': 'application/json'},
        url: 'http://172.19.145.34/qrcode-auth',
        body: user_token,
        json: true
      }, function(error, response, body){
        res.json({result: 1});
      });
    }
  });
});

/* POST guid (Mobile App -> this) */
router.post('/guid', function(req, res, next) {
  var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '8973',
    database: 'nc_qr_auth'
  });

  connection.connect(function (err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
  });

  var request = {
    user_token: req.body.userToken,
    guid: req.body.uuid
  };
  const secret = req.app.get('jwt-secret');

  try {
    const decoded = jwt.verify(request.user_token, secret);
    console.log("/user-token/validation (POST) : token is verify");
    console.log(decoded);
    console.log(decoded.id);
    console.log(request.guid);

    var params = [request.guid, decoded.id];
    connection.query('update user set guid=? where id=?', params, function (err, rows) {
      if (err) {
          console.error(err);
          throw err;
      }
      connection.end();
    });

    res.json({
      result: 1,
      message: "디바이스 등록 완료!"
    });
  } catch(err) {
    console.log("/user-token/validation (POST) : token is not verify");
    res.json({
      result: 0,
      message: "만료된 토큰입니다."
    });
  }  
});

module.exports = router;
