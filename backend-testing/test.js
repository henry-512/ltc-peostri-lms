import { expect } from 'chai'
import dotenv from 'dotenv'
import supertest from 'supertest'
import {
    authPassword,
    authUserName,
    checkFields,
    disown,
    imp,
    orphan,
} from './data/index.js'
dotenv.config()

process.env.API = process.env.API ?? 'v1/'

// .query('range=1..5')
// .send('{}')
// .send(jsonObj)
//https://visionmedia.github.io/superagent/

var agent = supertest.agent(`localhost:${process.env.PORT || 5000}/api/`)

const user = await imp('users')

// Authentication testing
describe('Authenticate', () => {
    it('Unauthorized access', async () => {
        let r = await agent.get('v1/projects')
        expect(r.status).equal(401)
    })

    it('Auth check, no auth', async () => {
        let r = await agent.get('auth')
        expect(r.status).equal(401)
    })

    it('Invalid username', async () => {
        let r = await agent.post('auth').send({
            username: 'hehe :)',
            password: authPassword,
        })
        expect(r.status).equal(400)
    })

    it('Invalid password', async () => {
        let r = await agent.post('auth').send({
            username: authUserName,
            password: 'grinning',
        })
        expect(r.status).equal(400)
    })

    it('Valid authenticate', async () => {
        let r = await agent.post('auth').send({
            username: authUserName,
            password: authPassword,
        })
        expect('token')
        expect('set-cookie', /token/)
        expect(r.status).equal(200)
        // Should return a user object
        checkFields(user.getId, r.body)
    })

    it('Auth check, valid auth', async () => {
        let r = await agent.get('auth')
        expect(r.status).equal(204)
    })

    it('Self user', async () => {
        let r = await agent.get(process.env.API + 'users/self')
        expect(r.status).equal(200)
        // Should return a user object
        checkFields(user.getId, r.body)
    })
})

async function test(n) {
    let raw = await imp(n)

    describe(`${n} GET all`, () => {
        it('Base call', async () => {
            let r = await agent.get(process.env.API + n)

            expect(r.headers)
                .an('object')
                .any.keys('content-range', 'access-control-expose-headers')
            expect(r.status).equal(200)
            expect(r.body).an('array')
        })
    })

    describe(`${n} GET one`, () => {
        it('Filter range [0,1]', async () => {
            let r = await agent.get(process.env.API + n).query({
                range: [0, 1],
            })

            expect(r.status).equal(200)
            expect(r.body).an('array').lengthOf(1)
            checkFields(raw.getAll, r.body[0])
        })

        it('GET/:id', async () => {
            let r = await agent.get(process.env.API + n).query({
                range: [0, 1],
            })

            let id = r.body[0].id

            r = await agent.get(process.env.API + n + '/' + id)

            expect(r.status).equal(200)
            checkFields(raw.getId, r.body)
        })
    })

    describe(`${n} POST accepts`, () => {
        raw.acceptPost.map((d) => {
            it(d.n, async () => {
                let r = await agent
                    .post(process.env.API + n)
                    .set('User-Agent', 'backend-testing')
                    .send(d.d)
                expect(r.status).equal(201)
                expect(r.body).an('object').any.key('id')
            })
        })
    })

    describe(`${n} POST fails`, () => {
        raw.failPost.map((d) => {
            it(d.n, async () => {
                let r = await agent
                    .post(process.env.API + n)
                    .set('User-Agent', 'backend-testing')
                    .send(d.d)
                expect(r.status).not.equal(201)
            })
        })
    })

    describe(`${n} PUT`, () => {
        let testData = { id: undefined, doc: undefined }

        it('Base case', async () => {
            let r = await agent
                .post(process.env.API + n)
                .send(raw.default)
            expect(r.status).equal(201)
            expect(r.body).an('object').any.key('id')
            testData.id = r.body.id
        })

        it('GET from DB', async () => {
            let r = await agent
                .get(`${process.env.API}${n}/${testData.id}`)
            expect(r.status).equal(200)
            checkFields(raw.getId, r.body)
            testData.doc = r.body
        })

        it('PUT valid data', async () => {
            expect(testData.id, 'Initial POST fault').a('string')
            let r = await agent
                .put(`${process.env.API}${n}/${testData.id}`)
                .send(raw.acceptPost[1].d)
            expect(r.status).equal(200)
            checkFields(raw.getId, r.body)
            expect(r.body.id).equal(testData.id)
        })

        it('PUT invalid data', async () => {
            expect(testData.id, 'Initial POST fault').a('string')
            let r = await agent
                .put(`${process.env.API}${n}/${testData.id}`)
                .send(raw.failPost[0].d)
            expect(r.status).not.equal(200)
        })

        it('DELETE data', async () => {
            expect(testData.id, 'Initial POST fault').a('string')
            let r = await agent
                .delete(`${process.env.API}${n}/${testData.id}`)
            expect(r.status).equal(200)
            expect(r.body.id).equal(testData.id)
        })
    })
}

// Load dynamic test data
await test('users')
await test('projects')
await test('template/modules')
await test('template/projects')

if (process.env.CLEAN) {
    // Clean disowned data
    describe('Disowned', function () {
        // These are beefy functions and need beefy runtimes
        this.timeout(10000)
        disown('projects', agent)
        disown('modules', agent)
        disown('tasks', agent)
        disown('users', agent)
        disown('comments', agent)
        disown('template/projects', agent)
    })

    // Delete orphaned data
    describe('Orphans', function () {
        // These are beefy functions and need beefy runtimes
        this.timeout(10000)
        orphan('modules', agent)
        orphan('tasks', agent)
        orphan('filemeta', agent)
        orphan('comments', agent)
    })
}
