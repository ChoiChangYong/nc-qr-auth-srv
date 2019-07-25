var models = require('../models');
var User = models.User;

/**
 * 디바이스 등록 & 디바이스 등록정보 업데이트
 */
exports.update = (id, guid, callback) => {
    User.update({guid: guid},{
        where: {id: id}
    }).then(function(result) {
        callback();
    });
}

/**
 * 해당 아이디의 GUID와 디바이스의 GUID 비교
 */
exports.compare = (input, target, callback) => {
    if(input==target)
        callback(true);
    else
        callback(false);
};