var models = require('../models');
var User = models.User;
var bcrypt = require('bcrypt-nodejs');

/**
 * 아이디 값이 일치하는 유저정보 검색
 */
exports.selectById = (id, callback) => {
    User.findOne({
        where: { id: id }
    }).then(function(result) {
        callback(result);
    }).catch(function(err){
        callback("empty");
    });
}

/**
 * 암호화된 유저 비밀번호 값 검증
 */
exports.confirmPassword = (input, target, callback) => {
    callback(bcrypt.compareSync(input, target));
}

/**
 * 유저 추가
 */
exports.insert = (user, callback) => {
    const salt = bcrypt.genSaltSync(10); // salt값 생성, 10이 default
    const hash = bcrypt.hashSync(user.password, salt); // Digest
    user.password = hash;

    User.create({
        id: user.id,
        password: user.password,
        name: user.name 
    }).then(function(result) {
        callback();
    });
}