var express = require('express');
var router = express.Router();
var login = require('../controllers/login');
var join = require('../controllers/join');

/* POST login (Web Server -> this) */
router.post('/login', login.checkUserInfo);

/* POST join (Web Server -> this) */
router.post('/join', join.createUser);

/* POST validate user token (Web Server -> this) */
router.post('/user-token/validation', login.checkUserToken);

/* GET QR-Code (Web Server -> this) */
router.get('/qrcode', login.getQrcode);

/* POST qrcode-auth (Mobile App -> this) */
router.post('/qrcode-auth', login.loginQrcode);

/* POST guid (Mobile App -> this) */
router.post('/guid', login.registerDevice);

/* POST validate user token (Web Server -> this) */
router.post('/guid/validation', login.checkDevice);

module.exports = router;
