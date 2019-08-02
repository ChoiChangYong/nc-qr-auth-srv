var models = require('../models');
var Session = models.Session;

/**
 * 유저 세션 유효성 검증
 */
exports.verifyUserSession = (sessionID) => {
    return new Promise(resolve => { 
        Session.findOne({
            where: { session_id: sessionID }
        }).then(function(result) {
            resolve(result);
        }).catch(function(err){
            console.log(err);
        });
    });
}

/**
 * 세션 데이터 파싱
 */
exports.parseSession = (session) => {
    return new Promise(resolve => { 
        resolve(JSON.parse(session));
    });
};

/**
 * 세션 삭제
 */
exports.deleteSession = (sessionID) => {
    return new Promise(resolve => { 
        Session.destroy({
            where: { session_id: sessionID }
        }).then(function(result) {
            resolve(result);
        }).catch(function(err){
            console.log(err);
        });
    });
};