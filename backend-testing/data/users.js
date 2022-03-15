const { debugRankKey, debugRankId, debugUserId } = require('.')

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
				'rank': debugRankId,
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
				'rank': debugRankId,
				'username': 'usName',
				'password': 'password'
			},
		}, {
			n: 'Valid key, not an ID',
			d: {
				'firstName': 'John',
				'lastName': 'Doe',
				'avatar': '',
				'rank': debugRankKey,
				'username': 'usName',
				'password': 'password'
			},
		},
	],
	failPost: [
		{
			n: 'Fully-formed rank',
			d: {
				'firstName': 'Jason',
				'lastName': 'Doe',
				'avatar': '',
				'rank': {
					'name': 'Jason\'s super-cool rank',
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
				'rank': debugRankId,
				'username': 'usName',
				'password': 'password'
			},
		}, {
			n: 'Additional field',
			d: {
				'firstName': 'Joshua',
				'lastName': 'Doe',
				'avatar': '',
				'rank': debugRankId,
				'super-cool-hackerinos': '; DROP TABLE USERS',
				'username': 'usName',
				'password': 'password',
			},
		}, {
			n: 'Incorrect type',
			d: {
				'firstName': { 'firstName': 'Jackson' },
				'lastName': 'Doe',
				'avatar': '',
				'rank': debugRankId,
				'username': 'usName',
				'password': 'password',
			},
		}, {
			n: 'Valid foreign id, but not a rank',
			d: {
				'firstName': 'Joe',
				'lastName': 'Doe',
				'avatar': '',
				'rank': debugUserId,
				'username': 'usName',
				'password': 'password'
			},
		}, {
			n: 'Empty string key',
			d: {
				'firstName': 'Jordan',
				'lastName': 'Doe',
				'avatar': '',
				'rank': '',
				'username': 'usName',
				'password': 'password'
			},
		}, {
			n: 'Invalid key',
			d: {
				'firstName': 'Jackie',
				'lastName': 'Doe',
				'avatar': '',
				'rank': '//:)',
				'username': 'usName',
				'password': 'password'
			}
		}, {
			n: 'Missing password',
			d: {
				'firstName': 'Jacklyn',
				'lastName': 'Doe',
				'avatar': '',
				'rank': debugRankId,
				'username': 'usName'
			},
		}
	],
}
