const request = require('request')

/**
 * QR Manage Server로 QR코드 요청
 */
exports.request = (callback) => {
    request.get({
        headers: {'content-type': 'application/json'},
        url: 'http://172.19.144.253:3000/qrcode',
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
exports.requestValidation = (qr_token, callback) => {
    request.post({
        headers: {'content-type': 'application/json'},
        url: 'http://172.19.144.253:3000/qrcode-token/validation',
        body: qr_token,
        json: true
    }, function(error, response, body){
        if(body.result==1)
            callback(true);
        else
            callback(false);
    });
};

/**
 * Web Server로 QR코드 로그인 인증 요청
 */
exports.requestQRcodeLogin = (user_token, callback) => {
    request.post({
        headers: {'content-type': 'application/json'},
        url: 'http://172.19.145.34/qrcode-auth',
        body: user_token,
        json: true
    }, function(error, response, body){
        if(body.result==0)
            callback(false)
        else
            callback(true);
    });
};