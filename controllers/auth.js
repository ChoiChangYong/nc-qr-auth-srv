var User = require('../services').User;
var Session = require('../services').Session;
var Qrcode = require('../services').Qrcode;
var DeviceId = require('../services').DeviceId;

var config = require('../config');

/**
 * 유저 아이디, 비밀번호 검증
 */
exports.authenticationUser = async (req, res, next) => {
    var request = {
        'id': req.body.id,
        'password': req.body.password
    };

    const verifyIdResult = await User.verifyId(request.id);

    if (verifyIdResult==null) {
        return res.json({result: 0, message: "아이디 또는 비밀번호가 맞지 않습니다."});
    }

    const verifyPasswordResult = await User.verifyPassword(request.password, verifyIdResult.password);
    
    if(!verifyPasswordResult){
        return res.json({result: 0, message: "아이디 또는 비밀번호가 맞지 않습니다."});
    } 

    // 유저 세션 생성
    const userUUID = verifyIdResult.uuid;
    req.session.appId = config.appId.web;
    req.session.userUUID = userUUID;
    console.log(req.session);
    req.session.save(() => {
        res.json({result: 1, sessionID: req.sessionID});
    });
};

/**
 * 유저 세션 검증
 */
exports.verifyUserSession = async (req, res, next) => {
    const request = {
        sessionID: req.body.sessionID
    }

    if(!request.sessionID){
        return res.json({result: 0, message: "로그인 정보가 존재하지 않습니다."});
    }
    
    const verifyUserSessionResult = await Session.verifyUserSession(request.sessionID);
    
    if(verifyUserSessionResult==null){
        res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
    }

    res.json({result: 1});
};

/**
 * SessionID로 유저 정보 검색, 반환
 */
exports.getUserInfoBySessionID = async (req, res, next) => {
    const request = {
        sessionID: req.params.sessionID
    }

    if(!request.sessionID){
        return res.json({result: 0, message: "유저 세션이 존재하지 않습니다."});
    }

    const verifyUserSessionResult = await Session.verifyUserSession(request.sessionID);
    
    if(verifyUserSessionResult==null){
        return res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
    }

    const parseSessionResult = await Session.parseSession(verifyUserSessionResult.data);
    const session = parseSessionResult;
    const getUserInfoByUUIDResult = await User.getUserInfoByUUID(session.userUUID);
    res.json({result: 1, id: getUserInfoByUUIDResult.id, name: getUserInfoByUUIDResult.name});
};

/**
 * 유저 세션 삭제
 */
exports.deleteUserSession = async (req, res, next) => {
    const request = {
        sessionID: req.params.sessionID
    }

    if(!request.sessionID){
        return res.json({result: 0, message: "유저 세션이 존재하지 않습니다."});
    } 

    const deleteSessionResult = await Session.deleteSession(request.sessionID);

    if(deleteSessionResult==0){
        return res.json({result: 1, message: "유저 세션이 존재하지 않습니다."});
    } else if(deleteSessionResult!=1){
        return res.json({result: 0, message: "세션 삭제 실패! 삭제된 row 개수:"+deleteSessionResult});
    }

    res.json({result: 1, message: "세션 삭제 성공"});
};

/**
 * QR코드 발급
 */
exports.createQrcode = async (req, res, next) => {
    const request = {
        instanceId: req.params.instanceId
    }

    const createQrcodeResult = await Qrcode.createQrcode(request.instanceId);

    if(!createQrcodeResult.result){
        return res.json({result: 0, massage: 'QR코드 발급 실패'});
    } 
    
    res.json({result: 1, qrcode: createQrcodeResult.qrcode, massage: 'QR코드 발급 성공'});
};

/**
 * QR코드 로그인 인증
 */
exports.authenticationQrcode = async (req, res, next) => {
    var request = {
        userSessionID: req.body.userSessionID,
        qrcodeSessionID: req.body.qrcodeSessionID
    };

    if(!request.userSessionID){
        return res.json({result: 0, message: "로그인 정보가 존재하지 않습니다."});
    } 
   
    const verifyUserSessionResult = await Session.verifyUserSession(request.userSessionID);

    if(verifyUserSessionResult==null){
        return res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
    } 
    
    const parseUserSessionResult = await Session.parseSession(verifyUserSessionResult.data);
    const userSession = parseUserSessionResult;

    const verifyQrCodeSessionResult = await Qrcode.verifyQrCodeSession(request.qrcodeSessionID);

    console.log(verifyQrCodeSessionResult);
    if(!verifyQrCodeSessionResult.result){
        return res.json({result: 2, message: "QR코드 세션이 만료되었습니다.\n다시 발급받아주세요!"});
    } 
    
    const parseQrCodeSessionResult = await Session.parseSession(verifyQrCodeSessionResult.qrcodeSession.data);
    const qrcodeSession = parseQrCodeSessionResult;

    // 유저 세션 셋팅
    req.session.appId = config.appId.qrcode;
    req.session.userUUID = userSession.userUUID;
    const userSessionID = req.sessionID;

    console.log('userSessionID : '+userSessionID);
    console.log('qrcodeSession.instanceId : '+qrcodeSession.instanceId);

    // 유저 세션 저장
    req.session.save(() => {
        Qrcode.processQrCodeLogin(userSessionID, qrcodeSession.instanceId, (callback) => {
            if(!callback){
                return res.json({result: 3, message: "QR코드 로그인 처리 실패!"});
            }
        });
        
        Qrcode.deleteQrcodeSession(request.qrcodeSessionID, (callback) => {
            if(!callback.result){
                console.log("세션삭제 실패");
                return res.json({result: 4, message: "세션삭제 실패!"});
            }
        });
        res.json({result: 1});
    });
}

/**
 * 디바이스 등록
 */
// exports.registerDevice = async (req, res, next) => {
//     var request = {
//         sessionID: req.body.sessionID,
//         deviceId: req.body.deviceId
//     };

//     const verifyUserSessionResult = await Session.verifyUserSession(request.sessionID);
//     if(verifyUserSessionResult==null){
//         res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
//     } else {
//         const parseSessionResult = await Session.parseSession(verifyUserSessionResult.data);
//         const session = parseSessionResult;
//         const updateDeviceIdByUUIDResult = await DeviceId.updateDeviceIdByUUID(session.userUUID);
//         res.json({result: 1, message: "디바이스 등록 완료!"});
//     }
// };

/**
 * 등록된 디바이스인지 검사
 */
// exports.checkDevice = async (req, res, next) => {
//     const request = {
//         sessionID: req.body.sessionID,
//         deviceId: req.body.deviceId
//     }
//     var user = {}

//     const verifyUserSessionResult = await Session.verifyUserSession(request.sessionID);
//     if(verifyUserSessionResult==null){
//         res.json({result: 0, message: "세션이 만료되었습니다.\n다시 로그인해주세요!"});
//     } else {
//         const parseSessionResult = await Session.parseSession(verifyUserSessionResult.data);
//         const userSession = parseSessionResult;
//         const getUserInfoByUUIDResult = await User.getUserInfoByUUID(userSession.userUUID);

//         user.id = getUserInfoByUUIDResult.id;
//         user.name = getUserInfoByUUIDResult.name;

//         // const verifyIdResult = await User.verifyId(getUserInfoByUUIDResult.id);
//         // if (verifyIdResult=="empty") {
//         //     res.json({result: 0, message: "디바이스 인증 정보가 없습니다."});
//         // } else {
//         //     const compareResult = await DeviceId.compare(request.deviceId, verifyIdResult.deviceId);
//         //     if(compareResult)
//         //         res.json({result: 1, id:user.id, name:user.name, message: "디바이스 인증 성공!"});
//         //     else
//         //         res.json({result: 0, message: "디바이스 인증 실패.."});
//         // }
//     }           
// }