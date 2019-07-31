var path = require('path');

var mysqlConfig = {
	debug: true,
	port: 3306,
	mysql: {
		// host: '127.0.0.1',
		host: '172.19.148.51',
		username: 'root',
		password: '8804',
		database: 'nc_qr_auth'
	}
}

var serverIP = {
	'webSrv': 'http://localhost',
	'authSrv': 'http://localhost:3000',
	'qrcodeSrv': 'http://localhost:3001',
	// 'webSrvlocal': 'http://172.19.148.83',
	// 'authSrvlocal': 'http://172.19.148.51:3000',
	// 'qrcodeSrvlocal': 'http://172.19.148.232:3001'
}

var appId = {
	'web': '100001',
	'mobile': '100002',
	'qrcode': '100003'
}

var sessionExpireTime = 60*60*1000;   // 1시간

module.exports = {
	'mysqlConfig': mysqlConfig,
	'serverIP': serverIP,
	'appId': appId,
	'sessionExpireTime': sessionExpireTime
}
