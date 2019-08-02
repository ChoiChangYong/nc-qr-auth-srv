var User = require('../services').User;

exports.addUser = async (req, res, next) => {
    var user = {
        'id': req.body.id,
        'password': req.body.password,
        'name': req.body.name
    };
    const verifyIdResult = await User.verifyId(user.id);

    if (verifyIdResult!=null) {
        return res.json({result: 0, message: "이미 존재하는 아이디입니다."});
    } 

    const addUserResult = await User.addUser(user);

    if(!addUserResult){
        return res.json({result: 0, message: "회원가입 실패"});
    }

    res.json({result: 1, message: "회원가입 성공"});
};