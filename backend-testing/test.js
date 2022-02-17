const request = require('supertest')('localhost:5000/api/v1/')
require('chai')

const { expect } = require('chai')
const user = require('./data/users.js')

// .query('range=1..5')
// .send('{}')
// .send(jsonObj)
//https://visionmedia.github.io/superagent/

describe('userGroups api', () => {
    it('GET userGroups/', async () => {
        const r = await request
            .get('userGroups')
            .set('User-Agent', 'backend-testing')
        expect(r.status).equal(200)
        //expect(r.headers['Content-Type']).match(/json/)
        expect(r.body).an('array')
    }
    // }request
        // .get(`${routePrefix}userGroups`)
        // .expect(200)
        // .expect({})
        // .then((res) => {
        //     assert.isNotEmpty(res.body)
        // })
        // .catch(err => {
        //     console.log(err)
        // })
    )
})