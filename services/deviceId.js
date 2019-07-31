var models = require('../models');
var User = models.User;

/**
 * 디바이스 등록 & 디바이스 등록정보 업데이트
 */
exports.updateDeviceIdByUUID = (userUUID, deviceId, callback) => {
    User.update({deviceId: deviceId},{
        where: { uuid: userUUID }
    }).then(function(result) {
        callback();
    });
}

/**
 * 해당 아이디의 deviceId와 디바이스의 deviceId 비교
 */
exports.compare = (input, target, callback) => {
    if(input==target)
        callback(true);
    else
        callback(false);
};