var User = require('../services').User;
var Token = require('../services').Token;
var Qrcode = require('../services').Qrcode;
var Guid = require('../services').Guid;

/**
 * 유저 아이디, 비밀번호 검증
 */
exports.checkUserInfo = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    var request = {
        'id': req.body.id,
        'password': req.body.password
    };

    User.selectById(request.id, (callback) => {
        if (callback!="empty") {
            const userInfo = {
                id: callback.id,
                name: callback.name
            }
            User.confirmPassword(request.password, callback.password, (callback) => {
                if(callback){
                    Token.create(userInfo, secret, (token) => {
                        res.json({
                            result: 1, 
                            user_token: token, 
                            id: userInfo.id, 
                            name: userInfo.name
                        });
                    });
                } else {
                    res.json({result: 0, message: "아이디 또는 비밀번호가 맞지 않습니다."});
                }
            });
        } else {
            res.json({result: 0, message: "아이디 또는 비밀번호가 맞지 않습니다."});
        }
    });
};

/**
 * 유저 토큰 검증
 */
exports.checkUserToken = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const request = {
        user_token: req.body.user_token
    }

    if(request.user_token){
        Token.validate(request.user_token, secret, (callback) => {
            if(callback.result){
                res.json({
                    result: 1,
                    id: callback.decoded.id,
                    name: callback.decoded.name,
                    message: "token is verify"
                });
            } else {
                res.json({result: 0, message: "토큰이 만료되었습니다.\n다시 로그인해주세요!"});
            }
        });
    } else {
        res.json({result: 0, message: "로그인 정보가 존재하지 않습니다."});
    }
};

/**
 * QR코드 발급
 */
exports.getQrcode = (req, res, next) => {
    Qrcode.request((callback) => {
        if(!callback.result){
            res.json({result: callback.result, massage: 'QR코드 발급 실패'});
        } else {
            res.json({result: callback.result, qrcode: callback.qrcode, massage: 'QR코드 발급 성공'});
        }
    });
};

/**
 * QR코드 로그인 인증
 */
exports.loginQrcode = (req, res, next) => {
    var user_token = {
        user_token: req.body.user_token
    };
    var qr_token = {
        qr_token: req.body.qr_token
    }

    Qrcode.requestValidation(qr_token, (callback) => {
        if(callback){
            Qrcode.requestQRcodeLogin(user_token, (callback) => {
                if(callback){
                    res.json({result: 1});
                } else {
                    res.json({result: 0});
                }
            });
        } else {
            res.json({result: 0});
        }
    });
}

/**
 * 디바이스 등록
 */
exports.registerDevice = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    var request = {
        user_token: req.body.userToken,
        guid: req.body.uuid
    };

    Token.validate(request.user_token, secret, (callback) => {
        if(callback.result){
            Guid.update(callback.decoded.id, request.guid, (callback) => {
                res.json({
                    result: 1,
                    message: "디바이스 등록 완료!"
                });
            });
        } else {
            res.json({
            result: 0,
            message: "만료된 토큰입니다."
            });
        }
    });
};

/**
 * 등록된 디바이스인지 검사
 */
exports.checkDevice = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const request = {
        user_token: req.body.user_token,
        guid: req.body.uuid
    }
    var user = {}

    Token.validate(request.user_token, secret, (callback) => {
        if(callback.result){
            user.id = callback.decoded.id;
            user.name = callback.decoded.name;

            User.selectById(callback.decoded.id, (callback) => {
                if (callback!="empty") {
                    Guid.compare(request.guid, callback.guid, (callback) => {
                        if(callback)
                            res.json({result: 1, id:user.id, name:user.name, message: "디바이스 인증 성공!"});
                        else
                            res.json({result: 0, message: "디바이스 인증 실패.."});
                    });
                } else {
                    res.json({result: 0, message: "디바이스 인증 정보가 없습니다."});
                }
            });
        }
    });
    
}