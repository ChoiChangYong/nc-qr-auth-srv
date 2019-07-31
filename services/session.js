var models = require('../models');
var Session = models.Session;

/**
 * 유저 세션 유효성 검증
 */
exports.verifyUserSession = (sessionID, callback) => {
    Session.findOne({
        where: { session_id: sessionID }
    }).then(function(result) {
        callback(result);
    }).catch(function(err){
        console.log(err);
    });
}

/**
 * 세션 데이터 파싱
 */
exports.parseSession = (session, callback) => {
    callback(JSON.parse(session));
};

/**
 * 세션 삭제
 */
exports.deleteSession = (sessionID, callback) => {
    Session.destroy({
        where: { session_id: sessionID }
    }).then(function(result) {
        callback(result);
    }).catch(function(err){
        console.log(err);
    });
};