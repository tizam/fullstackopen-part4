const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlog) {
    let blogObject = new Blog(blog)
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
    const newBlog = {
      title: 'New Blog Title',
      author: 'Ladoui Abdellah',
      url: 'https://ladouiabdellah.com/',
      likes: 5,
    }

    await api
      .post('/api/blog')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd.length).toBe(helper.initialBlog.length + 1)
  })

  test('"likes" props will default to 0 if it is missing from the request', async () => {
    const newBlog = {
      title: 'Last Blog Title',
      author: 'Ladoui Abdellah',
      url: 'https://ladouiabdellah.com/',
    }

    await api
      .post('/api/blog')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toEqual(0)
  })

  test('return status 400 if title and url are missing', async () => {
    const newBlog = {
      author: 'Ladoui Abdellah',
      likes: 5,
    }

    await api.post('/api/blog').send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlog.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 when blog is deleted', async () => {
    const blogsAtStart = await helper.blogInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blog/${blogToDelete.id}`).expect(204)

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
