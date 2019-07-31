var User = require('../services').User;
var Session = require('../services').Session;
var Qrcode = require('../services').Qrcode;
var DeviceId = require('../services').DeviceId;

var config = require('../config');

/**
 * 유저 아이디, 비밀번호 검증
 */
exports.authenticationUser = (req, res, next) => {
    var request = {
        'id': req.body.id,
        'password': req.body.password
    };

    User.verifyId(request.id, (callback) => {
        if (callback!=null) {
            const userUUID = callback.uuid;

            User.verifyPassword(request.password, callback.password, (callback) => {
                if(callback){
                    // 유저 세션 생성
                    req.session.appId = config.appId.web;
                    req.session.userUUID = userUUID;
                    console.log(req.session);
                    req.session.save(() => {
                        res.json({result: 1, sessionID: req.sessionID});
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
 * 유저 세션 검증
 */
exports.verifyUserSession = (req, res, next) => {
    const request = {
        sessionID: req.body.sessionID
    }

    if(request.sessionID){
        Session.verifyUserSession(request.sessionID, (callback) => {
            if(callback!=null)
                res.json({result: 1, message: "session is verify"});
            else
                res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
        });
    } else {
        res.json({result: 0, message: "로그인 정보가 존재하지 않습니다."});
    }
};

/**
 * SessionID로 유저 정보 검색, 반환
 */
exports.getUserInfoBySessionID = (req, res, next) => {
    const request = {
        sessionID: req.params.sessionID
    }

    if(request.sessionID){
        Session.verifyUserSession(request.sessionID, (callback) => {
            if(callback!=null){
                Session.parseSession(callback.data, (callback) => {
                    const session = callback;
                    User.getUserInfoByUUID(session.userUUID, (callback) => {
                        res.json({result: 1, id: callback.id, name: callback.name});
                    });
                });
            } else {
                res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
            }
        });
    } else {
        res.json({result: 0, message: "유저 세션이 존재하지 않습니다."});
    }
};

/**
 * 유저 세션 삭제
 */
exports.deleteUserSession = (req, res, next) => {
    const request = {
        sessionID: req.params.sessionID
    }

    if(request.sessionID){
        Session.deleteSession(request.sessionID, (callback) => {
            if(callback==1)
                res.json({result: 1, message: "세션 삭제 성공"});
            else
                res.json({result: 0, message: "세션 삭제 실패! 삭제된 row 개수:"+callback});
        });
    } else {
        res.json({result: 0, message: "유저 세션이 존재하지 않습니다."});
    }
};

/**
 * QR코드 발급
 */
exports.createQrcode = (req, res, next) => {
    const request = {
        instanceId: req.params.instanceId
    }

    Qrcode.createQrcode(request.instanceId, (callback) => {
        if(!callback.result){
            res.json({result: 0, massage: 'QR코드 발급 실패'});
        } else {
            res.json({result: 1, qrcode: callback.qrcode, massage: 'QR코드 발급 성공'});
        }
    });
};

/**
 * QR코드 로그인 인증
 */
exports.authenticationQrcode = (req, res, next) => {
    var request = {
        userSessionID: req.body.userSessionID,
        qrcodeSessionID: req.body.qrcodeSessionID
    };

    if(request.userSessionID){
        Session.verifyUserSession(request.userSessionID, (callback) => {
            if(callback!=null){
                Session.parseSession(callback.data, (callback) => {
                    const userSession = callback;
                    // 유저 세션 셋팅
                    req.session.appId = config.appId.qrcode;
                    req.session.userUUID = userSession.userUUID;
                    console.log(req.session);

                    Qrcode.verifyQrCodeSession(request.qrcodeSessionID, (callback) => {
                        if(callback.result){
                            Session.parseSession(callback.qrcodeSession.data, (callback) => {
                                const qrcodeSession = callback;

                                console.log('req.sessionID : '+req.sessionID);
                                console.log('qrcodeSession.instanceId : '+qrcodeSession.instanceId);
                                // 유저 세션 생성
                                req.session.save(() => {
                                    Qrcode.processQrCodeLogin(req.sessionID, qrcodeSession.instanceId, (callback) => {
                                        if(callback){
                                            Qrcode.deleteQrcodeSession(request.qrcodeSessionID, (callback) => {
                                                if(callback.result)
                                                    console.log("세션삭제 성공");
                                                else
                                                    console.log("세션삭제 실패");
                                            });
                                            res.json({result: 1});
                                        } else {
                                            res.json({result: 0});
                                        }
                                    });
                                });
                            });
                        } else {
                            res.json({result: 0, message: "QR코드 세션이 만료되었습니다.\n다시 발급받아주세요!"});
                        }
                    });
                });
            } else {
                res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
            }
        });
    } else {
        res.json({result: 0, message: "로그인 정보가 존재하지 않습니다."});
    }
}

/**
 * 디바이스 등록
 */
exports.registerDevice = (req, res, next) => {
    var request = {
        sessionID: req.body.sessionID,
        deviceId: req.body.deviceId
    };

    Session.verifyUserSession(request.sessionID, (callback) => {
        if(callback!=null){
            Session.parseSession(callback.data, (callback) => {
                const session = callback;
                DeviceId.updateDeviceIdByUUID(callback.userUUID, request.deviceId, (callback) => {
                    res.json({
                        result: 1,
                        message: "디바이스 등록 완료!"
                    });
                });
            });
        } else {
            res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
        }
    });
};

/**
 * 등록된 디바이스인지 검사
 */
exports.checkDevice = (req, res, next) => {
    const request = {
        sessionID: req.body.sessionID,
        deviceId: req.body.deviceId
    }
    var user = {}

    Session.verifyUserSession(request.sessionID, (callback) => {
        if(callback.result){
            user.id = callback.decoded.id;
            user.name = callback.decoded.name;

            User.verifyId(callback.decoded.id, (callback) => {
                if (callback!="empty") {
                    DeviceId.compare(request.deviceId, callback.deviceId, (callback) => {
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