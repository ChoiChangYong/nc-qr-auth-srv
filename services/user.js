var models = require('../models');
var User = models.User;
var bcrypt = require('bcrypt-nodejs');

/**
 * 아이디 값이 일치하는 유저정보 검색
 */
exports.verifyId = (id) => {
    return new Promise(resolve => { 
        User.findOne({
            where: { id: id }
        }).then(function(result) {
            resolve(result);
        }).catch(function(err){
            console.log(err);
        });
    });
}

/**
 * 암호화된 유저 비밀번호 값 검증
 */
exports.verifyPassword = (input, target) => {
    return new Promise(resolve => { 
        resolve(bcrypt.compareSync(input, target));
    });
}

/**
 * 유저 추가
 */
exports.addUser = (user) => {
    return new Promise(resolve => { 
        const salt = bcrypt.genSaltSync(10); // salt값 생성, 10이 default
        const hash = bcrypt.hashSync(user.password, salt); // Digest
        user.password = hash;
        console.log(user);
        User.create({
            uuid: getUUID(),
            id: user.id,
            password: user.password,
            name: user.name 
        }).then(function(result) {
            resolve(true);
        }).catch(function(err){
            resolve(false);
        });
    });
}

/**
 * UUID 생성
 */
function getUUID() {
    function s4() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

/**
 * UUID 값이 일치하는 유저정보 검색
 */
exports.getUserInfoByUUID = (userUUID) => {
    return new Promise(resolve => { 
        User.findOne({
            where: { uuid: userUUID }
        }).then(function(result) {
            resolve(result);
        }).catch(function(err){
            console.log(err);
        });
    });
}