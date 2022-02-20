const { debugUserGroupKey, debugUserGroupId, debugUserId } = require('.')

module.exports = {
	chain: {
		post: {
			'firstName': 'John',
			'lastName': 'Doe',
			'avatar': '',
			'userGroup': debugUserGroupId
		},
		acceptPut: []
	},
	acceptPost: [
		{
			n: 'Base case',
			d: {
				'firstName': 'John',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': debugUserGroupId
			},
		}, {
			n: 'Passed ID',
			d: {
				'id': 'id-insertion',
				'firstName': 'John',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': debugUserGroupId
			},
		}, {
			n: 'Valid key, not an ID',
			d: {
				'firstName': 'John',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': debugUserGroupKey
			},
		},
	],
	failPost: [
		{
			n: 'Fully-formed userGroup (not valid for this call)',
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
				}
			}
		}, {
			n: 'Missing fields',
			d: {
				'firstName': 'Josh',
				'userGroup': debugUserGroupId
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
				'userGroup': debugUserId
			},
		}, {
			n: 'Empty string key',
			d: {
				'firstName': 'Jordan',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': ''
			},
		}, {
			n: 'Invalid key',
			d: {
				'firstName': 'Jordan',
				'lastName': 'Doe',
				'avatar': '',
				'userGroup': '//:)'
			}
		}
	],
}
