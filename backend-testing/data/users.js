const { debugUserGroupKey, debugUserGroupId } = require('.')

module.exports = [
	{
		n: 'Base case',
		expect: {
			code:200
		},
		request: {
			'firstName': 'John',
			'lastName': 'Doe',
			'avatar': '',
			'userGroup': debugUserGroupId
		}
	},
	{
		n: 'Fully-formed userGroup (not valid for this call)',
		expect: {
			code:500
		},
		request: {
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
	},
	// Missing fields
	{
		'firstName': 'Josh',
		'userGroup': debugUserGroupId
	},
	// Additional field
	{
		'firstName': 'Joshua',
		'lastName': 'Doe',
		'avatar': '',
		'userGroup': debugUserGroupId,
		'super-cool-hackerinos': '; DROP TABLE USERS'
	},
	// Valid key, but not a userGroup
	{
		'firstName': 'Joe',
		'lastName': 'Doe',
		'avatar': '',
		'userGroup': debugUserGroupId
	},
	// Empty string key
	{
		'firstName': 'Jordan',
		'lastName': 'Doe',
		'avatar': '',
		'userGroup': ''
	},
	// Passed ID
	{
		'id': 'id-insertion',
		'firstName': 'John',
		'lastName': 'Doe',
		'avatar': '',
		'userGroup': debugUserGroupId
	},
	// Valid key, not an ID
	{
		'firstName': 'John',
		'lastName': 'Doe',
		'avatar': '',
		'userGroup': debugUserGroupKey
	}
]
