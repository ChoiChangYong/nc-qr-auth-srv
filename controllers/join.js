var User = require('../services').User;

exports.createUser = (req, res, next) => {
    var user = {
        'id': req.body.id,
        'password': req.body.password,
        'name': req.body.name
    };
    console.log(user);
    User.selectById(user.id, (callback) => {
        if (callback==null) {
            User.insert(user, (callback) => {
                if(callback)
                    res.json({result: 1, message: "회원가입 성공"});
                else
                    res.json({result: 0, message: "회원가입 실패"});
            });
        } else {
            res.json({result: 0, message: "이미 존재하는 아이디입니다."});
        }
    });
};