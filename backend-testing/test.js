let supertest = require('supertest')
const { expect } = require('chai')
const { authUserName, authPassword } = require('./data')

// .query('range=1..5')
// .send('{}')
// .send(jsonObj)
//https://visionmedia.github.io/superagent/

var API = 'v1/'
var agent = supertest.agent('localhost:5000/api/')

describe(`Authenticate`, () => {
    it('Invalid username', async () => {
        let r = await agent
            .post('auth')
            .send({
                username: 'hehe :)',
                password: authPassword
            })
        expect(r.status).not.equal(200)
    })

    it('Invalid password', async () => {
        let r = await agent
            .post('auth')
            .send({
                username: authUserName,
                password: 'grinning'
            })
        expect(r.status).not.equal(200)
    })

    it('Valid authenticate', async () => {
        let r = await agent
            .post('auth')
            .send({
                username: authUserName,
                password: authPassword,
            })
        expect(r.status).equal(200)
        expect('token')
        expect('set-cookie', /token/)
        // expect(r.body).an('object')
        //     .any.key('token')

    })
})

function test(n) {
    let raw = require(`./data/${n}`)

    describe(`${n} GET all`, () => {
        it('Base call', async () => {
            let r = await agent
                .get(API + n)
                
            expect(r.status).equal(200)
            expect(r.headers).an('object')
                .any.keys('content-range','access-control-expose-headers')
            expect(r.body).an('array')
        })
    })

    describe(`${n} GET one`, () => {
        it('Test fields', async () => {
            let r = await agent
                .get(API + n)
                .query({
                    range:[0,1],
                })
            
            expect(r.status).equal(200)
            expect(r.body).an('array').lengthOf(1)
            // expect(r.body[0]).property('username').a('string')
        })
    })

    // This takes too long for projects
    // Refactor into multiple describe() calls?
    //if (n !== 'projects') {
        /*
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
    */

    describe(`${n} POST accepts`, () => {
        raw.acceptPost.map(d => {
            it(d.n, async () => {
                let r = await agent
                    .post(API + n)
                    .set('User-Agent', 'backend-testing')
                    // .set('Authorization', AUTH_HEADER)
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
                let r = await agent
                    .post(API + n)
                    .set('User-Agent', 'backend-testing')
                    // .set('Authorization', AUTH_HEADER)
                    .send(d.d)
                expect(r.status).not.equal(201)
            })
        })
    })
}

// Load dynamic test data
test('users')
test('projects')

// Clean disowned data
describe('Disowned', function() {
    // These are beefy functions and need beefy runtimes
    this.timeout(10000)

    it('Disown Projects', async () => {
        let r = await agent
            .set('User-Agent', 'backend-testing')
            .delete(API + 'projects/disown')
        expect(r.status).equal(200)
    })
    it('Disown Modules', async () => {
        let r = await agent
            .set('User-Agent', 'backend-testing')
            .delete(API + 'modules/disown')
        expect(r.status).equal(200)
    })
    it('Disown Tasks', async () => {
        let r = await agent
            .set('User-Agent', 'backend-testing')
            .delete(API + 'tasks/disown')
        expect(r.status).equal(200)
    })
    it('Disown Users', async () => {
        let r = await agent
            .set('User-Agent', 'backend-testing')
            .delete(API + 'users/disown')
        expect(r.status).equal(200)
    })
    it('Disown Comments', async () => {
        let r = await agent
            .set('User-Agent', 'backend-testing')
            .delete(API + 'comments/disown')
        expect(r.status).equal(200)
    })
})

// Delete orphaned data
describe('Orphans', () => {
    it('del Orphan Modules', async () => {
        let r = await agent
            .set('User-Agent', 'backend-testing')
            .delete(API + 'modules/orphan')
        expect(r.status).equal(200)
    })
    it('del Orphan Tasks', async () => {
        let r = await agent
            .set('User-Agent', 'backend-testing')
            .delete(API + 'tasks/orphan')
        expect(r.status).equal(200)
    })
})
