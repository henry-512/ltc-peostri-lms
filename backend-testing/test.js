const request = require('supertest')('localhost:5000/api/v1/')
const { expect } = require('chai')

// .query('range=1..5')
// .send('{}')
// .send(jsonObj)
//https://visionmedia.github.io/superagent/

function test(n) {
    let raw = require(`./data/${n}`)

    describe(`${n} GET all`, () => {
        it('Base call', async () => {
            let r = await request
                .get(n)
            expect(r.status).equal(200)
            expect(r.headers).an('object')
                .any.keys('content-range','access-control-expose-headers')
        })
    })

    // This takes too long for projects
    // Refactor into multiple describe() calls?
    if (n !== 'projects') {
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
                    .send(d.d)
                expect(r.status).not.equal(201)
            })
        })
    })
}

test('users')
test('projects')
