const request = require('request')
var config = require('../config');

/**
 * QR Manage Server로 QR코드 요청
 */
exports.createQrcode = (instanceId, callback) => {
    request.get({
        headers: {'content-type': 'application/json'},
        url: config.serverIP.qrcodeSrv+'/qrcode/'+instanceId,
        json: true
    }, function(error, response, body){
        if(body.result==1)
          callback({result:true, qrcode:body.qrcode});
        else
          callback({result:false});
    });
}

/**
 * QR Manage Server로 QR코드 유효성 검증 요청
 */
exports.verifyQrCodeSession = (qrcodeSessionID, callback) => {
    request.post({
        headers: {'content-type': 'application/json'},
        url: config.serverIP.qrcodeSrv+'/session/verification',
        body: {qrcodeSessionID},
        json: true
    }, function(error, response, body){
        if(body.result==1)
            callback({result:true, qrcodeSession:body.qrcodeSession});
        else
            callback({result:false});
    });
};

/**
 * Web Server로 QR코드 로그인 인증 요청
 */
exports.processQrCodeLogin = (userSessionID, instanceId, callback) => {
    request.post({
        headers: {'content-type': 'application/json'},
        url: config.serverIP.webSrv+'/qrcode-auth',
        body: {
            userSessionID: userSessionID,
            instanceId: instanceId
        },
        json: true
    }, function(error, response, body){
        if(body.result==0)
            callback(false)
        else
            callback(true);
    });
};

/**
 * Auth Server로 QR코드 세션 삭제 요청
 */
exports.deleteQrcodeSession = (qrcodeSessionID, callback) => {
    request.delete({
        headers: {'content-type': 'application/json'},
        url: config.serverIP.qrcodeSrv+'/sessions/'+qrcodeSessionID,
        json: true
      }, function(error, response, body){
        console.log(body);
        if(body.result==0){
            callback({result:false});
        } else {
            callback({result:true});
        }
    });
};