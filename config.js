var path = require('path');

var config = {
	debug: true,
	port: 3306,
	mysql: {
		host: '127.0.0.1',
		username: 'root',
		password: '8804',
		database: 'nc_qr_auth'
	}
}

module.exports = {
    'secret': 'tjqltmvmffotvhaCHLCKDDYD',
    'config': config
}
