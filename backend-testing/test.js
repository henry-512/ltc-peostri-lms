const request = require('supertest')('localhost:5000/api/v1/')
require('chai')

const { expect } = require('chai')
const user = require('./data/users.js')

// .query('range=1..5')
// .send('{}')
// .send(jsonObj)
//https://visionmedia.github.io/superagent/

function test(n) {
    let raw = require(`./data/${n}`)

    describe(`${n} GET all`, () => {
        it('Base call', async () => {
            r = await request
                .get(`${n}`)
            expect(r.status).equal(200)
            expect(r.headers).an('object')
                .any.keys('content-range','access-control-expose-headers')
        })
    })

    describe(`${n} POST/GET/PUT/DELETE chain`, () => {
        it('Chain code', async () => {
            r = await request
                .post(`${n}`)
                .send(raw.chain.post)
            expect(r.status).equal(201)
            expect()

            // PUT
            for (let data in raw.chain.acceptPut) {
                r = await request
                    .put(`${n}/${id}`)
            }
        })
    })

    describe(`${n} POST accepts`, () => {
        raw.acceptPost.map(d => {
            it(`${d.n}`, async () => {
                r = await request
                    .post(`${n}`)
                    .set('User-Agent', 'backend-testing')
                    .send(d.d)
                expect(r.status).equal(201)
            })
        })
    })

    describe(`${n} POST fails`, () => {
        raw.failPost.map(d => {
            it(`${d.n}`, async () => {
                r = await request
                    .post(`${n}`)
                    .set('User-Agent', 'backend-testing')
                    .send(d.d)
                expect(r.status).not.equal(201)
            })
        })
    })
}

test('users')
// test('projects')
