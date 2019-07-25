const jwt = require('jsonwebtoken');

/**
 * 유저 토큰 생성
 */
exports.create = (userInfo, secret, callback) => {
    const token = jwt.sign(
        userInfo, 
        secret, 
        {
            algorithm: 'HS512',
            // expiresIn: 60 * 60 * 24 * 7
            expiresIn: '24h' // 30초, 1m:1분
        }
    )
    callback(token);
}

/**
 * 유저 토큰 유효성 검증
 */
exports.validate = (user_token, secret, callback) => {
    try {
        const decoded = jwt.verify(user_token, secret);
        callback({result:true, decoded:decoded});
    } catch(err) {
        callback({result:false});
    }
}