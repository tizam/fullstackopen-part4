const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)


describe('create users', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    
    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({username: 'root', name: 'root', passwordHash})
    
    await user.save()
  })

  test('create user success', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username : 'bidam',
      name: 'ladoui abdellah',
      password: 'meriem'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
    
  test('username is unique', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'superuser',
      password: 'meriem'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('username and password are required', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'new user'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password are required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('username and password must have at least 3 chars longs', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ab',
      name: 'invalid name',
      password: 'cv'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('username and password must be at least 3 charachters long')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
  

