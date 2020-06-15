const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)

const userLoginInfo = async () => {
  const user = await helper.usersInDb()
  const password = 'secret'
    
  const userToLogin = {
    username: user[0].username,
    password
  }
  const result = await api
    .post('/api/login')
    .send(userToLogin)
    .expect(200)

  const token = result.body.token
  const id = user[0].id

  return {token, id}
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({username: 'root', name: 'root', passwordHash})
    
  await user.save()

  for (let blog of helper.initialBlog) {
    let blogObject = new Blog({...blog, user})
    await blogObject.save()
  }
})

describe('blog list api', () => {
  test('application returns the correct amount of blog posts in the JSON format', async () => {
    await api
      .get('/api/blog')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('the unique identifier property of the blog posts is named id', async () => {
    const blogPosts = await api.get('/api/blog')

    expect(blogPosts.body[0].id).toBeDefined()
  })
})

describe('creation of blogs api', () => {
  test('creates a new blog post', async () => {
    const loginInfo = await userLoginInfo()

    const newBlog = {
      title: 'New Blog Title',
      author: 'Ladoui Abdellah',
      url: 'https://ladouiabdellah.com/',
      likes: 5,
      user: loginInfo.id
    }

    await api
      .post('/api/blog')
      .set({'Authorization': `Bearer ${loginInfo.token}`})
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd.length).toBe(helper.initialBlog.length + 1)
  })

  test('"likes" props will default to 0 if it is missing from the request', async () => {

    const loginInfo = await userLoginInfo()

    const newBlog = {
      title: 'Last Blog Title',
      author: 'Ladoui Abdellah',
      url: 'https://ladouiabdellah.com/',
      user: loginInfo.id
    }

    await api
      .post('/api/blog')
      .set({'Authorization': `Bearer ${loginInfo.token}`})
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toEqual(0)
  })

  test('return status 400 if title and url are missing', async () => {
    const loginInfo = await userLoginInfo()

    const newBlog = {
      author: 'Ladoui Abdellah',
      likes: 5,
      user: loginInfo.id
    }

    await api
      .post('/api/blog')
      .set({'Authorization': `Bearer ${loginInfo.token}`})
      .send(newBlog).expect(401)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlog.length)
  })

  test('add blog fail if token is missing', async () => {

    const newBlog = {
      title: 'New Blog Title',
      author: 'Ladoui Abdellah',
      url: 'https://ladouiabdellah.com/',
      likes: 5,
    }

    await api
      .post('/api/blog')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd.length).toBe(helper.initialBlog.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 when blog is deleted', async () => {
    const blogsAtStart = await helper.blogInDb()
    const blogToDelete = blogsAtStart[0]
    const loginInfo = await userLoginInfo()

    await api
      .delete(`/api/blog/${blogToDelete.id}`)
      .set({'Authorization': `Bearer ${loginInfo.token}`}).expect(204)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlog.length - 1)

    const titles = blogsAtEnd.map((t) => t.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('update of a blog', () => {
  test('updating information of a blog post', async () => {
    const blogsAtStart = await helper.blogInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = {
      ...blogToUpdate,
      title: 'Updated Title',
    }

    await api
      .put(`/api/blog/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlog.length)

    const titles = blogsAtEnd.map((t) => t.title)

    expect(titles).toContain('Updated Title')
  })
})

afterAll((done) => {
  mongoose.connection.close()
  done()
})
