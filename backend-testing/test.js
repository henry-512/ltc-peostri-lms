let req = require('supertest')
const { expect } = require('chai')
const { authUserName, authPassword } = require('./data')

// .query('range=1..5')
// .send('{}')
// .send(jsonObj)
//https://visionmedia.github.io/superagent/

var TOKEN
var AUTH_HEADER

describe(`Authenticate`, () => {
    let request = req('localhost:5000/')

    it('Valid authenticate', async () => {
        let r = await request
            .post('auth')
            .send({
                username: authUserName,
                password: authPassword,
            })
        expect(r.status).equal(200)
        expect(r.body).an('object')
            .any.key('token')
        
        TOKEN = r.body.token
        AUTH_HEADER = `Bearer ${TOKEN}`
    })

    it('Invalid username', async () => {
        let r = await request
            .post('auth')
            .send({
                username: 'hehe :)',
                password: authPassword
            })
        expect(r.status).not.equal(200)
    })

    it('Invalid password', async () => {
        let r = await request
            .post('auth')
            .send({
                username: authUserName,
                password: 'grinning'
            })
        expect(r.status).not.equal(200)
    })
})

function test(n) {
    let request = req('localhost:5000/api/v1/')
    let raw = require(`./data/${n}`)

    describe(`${n} GET all`, () => {
        it('Base call', async () => {
            let r = await request
                .get(n)
                .set('Authorization', AUTH_HEADER)
                
            expect(r.status).equal(200)
            expect(r.headers).an('object')
                .any.keys('content-range','access-control-expose-headers')
        })
    })

    // This takes too long for projects
    // Refactor into multiple describe() calls?
    //if (n !== 'projects') {
    if (false) {
    describe(`${n} POST/GET/PUT/DELETE chain`, () => {
        it('Chain code', async () => {
            let r = await request
                .post(n)
                .send(raw.chain.post || raw.acceptPost[0].d)
            expect(r.status).equal(201)
            expect(r.body).an('object')
                .any.key('id')
            
            let key = r.body.id
            let route = `${n}/${key}`

            r = await request
                .get(route)
            expect(r.status).equal(200)
            expect(r.body).an('object')
            expect(r.body.id).equal(key)

            // PUT
            // Try to upload POST-acceptable data
            for (let data of raw.acceptPost) {
                r = await request
                    .put(route)
                    .send(data.d)
                expect(r.status).equal(200)
                expect(r.body).an('object')
                expect(r.body.id).equal(key)
            }
            // Try to upload POST-unacceptable data
            for (let data of raw.failPost) {
                r = await request
                    .post(n)
                    .set('User-Agent', 'backend-testing')
                    .send(data.d)
                expect(r.status).not.equal(201)
            }

            // Delete test document
            r = await request
                .delete(route)
            expect(r.status).equal(200)

            // Verify actually deleted
            r = await request
                .get(route)
            expect(r.status).equal(404)
        })
    })
    }

    describe(`${n} POST accepts`, () => {
        raw.acceptPost.map(d => {
            it(d.n, async () => {
                let r = await request
                    .post(n)
                    .set('User-Agent', 'backend-testing')
                    .set('Authorization', AUTH_HEADER)
                    .send(d.d)
                expect(r.status).equal(201)
                expect(r.body).an('object')
                    .any.key('id')
            })
        })
    })

    describe(`${n} POST fails`, () => {
        raw.failPost.map(d => {
            it(d.n, async () => {
                let r = await request
                    .post(n)
                    .set('User-Agent', 'backend-testing')
                    .set('Authorization', AUTH_HEADER)
                    .send(d.d)
                expect(r.status).not.equal(201)
            })
        })
    })
}

test('users')
test('projects')
