const { debugUserGroupKey, debugUserGroupId, debugUserId } = require('.')

module.exports = {
	chain: {
		acceptPut: [],
		failPut: [],
	},
	acceptPost: [
		{
			n: 'Base case',
			d: {
				'firstName': 'John',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': debugUserGroupId,
				'username': 'usName',
				'password': 'password'
			},
		}, {
			n: 'Passed ID',
			d: {
				'id': 'id-insertion',
				'firstName': 'John',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': debugUserGroupId,
				'username': 'usName',
				'password': 'password'
			},
		}, {
			n: 'Valid key, not an ID',
			d: {
				'firstName': 'John',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': debugUserGroupKey,
				'username': 'usName',
				'password': 'password'
			},
		},
	],
	failPost: [
		{
			n: 'Fully-formed userGroup',
			d: {
				'firstName': 'Jason',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': {
					'name': 'Jason\'s super-cool Usergroup',
					'permissions': {
						'perm1': true,
						'perm2': true,
						'perm3': true
					}
				},
				'username': 'usName',
				'password': 'password'
			}
		}, {
			n: 'Missing fields',
			d: {
				'firstName': 'Josh',
				'userGroup': debugUserGroupId,
				'username': 'usName',
				'password': 'password'
			},
		}, {
		// 	n: 'Additional field',
		// 	d: {
		// 		'firstName': 'Joshua',
		// 		'lastName': 'Doe',
		// 		'avatar': '',
		// 		'userGroup': debugUserGroupId,
		// 		'super-cool-hackerinos': '; DROP TABLE USERS'
		// 	},
		// }, {
			n: 'Valid foreign id, but not a userGroup',
			d: {
				'firstName': 'Joe',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': debugUserId,
				'username': 'usName',
				'password': 'password'
			},
		}, {
			n: 'Empty string key',
			d: {
				'firstName': 'Jordan',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': '',
				'username': 'usName',
				'password': 'password'
			},
		}, {
			n: 'Invalid key',
			d: {
				'firstName': 'Jackie',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': '//:)',
				'username': 'usName',
				'password': 'password'
			}
		}, {
			n: 'Missing password',
			d: {
				'firstName': 'Jacklyn',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': debugUserGroupId,
				'username': 'usName'
			},
		}
	],
}
