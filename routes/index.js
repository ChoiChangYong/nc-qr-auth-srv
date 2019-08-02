var express = require('express');
var router = express.Router();
var auth = require('../controllers/auth');
var join = require('../controllers/join');

/* POST login (Web Server -> this) */
router.post('/login', auth.authenticationUser);

/* POST join (Web Server -> this) */
router.post('/join', join.addUser);

/* POST verify user session (Web Server, Mobile App -> this) */
router.post('/session/verification', auth.verifyUserSession);

/* GET user info by session id (Web Server, Mobile App -> this) */
router.get('/users/:sessionID', auth.getUserInfoBySessionID);

/* DELETE user session (Web Server -> this) */
router.delete('/sessions/:sessionID', auth.deleteUserSession);

/* GET QR-Code (Web Server -> this) */
router.get('/qrcode/:instanceId', auth.createQrcode);

/* POST qrcode-auth (Mobile App -> this) */
router.post('/qrcode-auth', auth.authenticationQrcode);

/* POST deviceId (Mobile App -> this) */
// router.post('/deviceId', auth.registerDevice);

/* POST verify deviceId (Mobile App -> this) */
// router.post('/deviceId/verification', auth.checkDevice);

module.exports = router;
