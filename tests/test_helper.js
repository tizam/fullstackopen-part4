const Blog = require('../models/blog')
const User = require('../models/user')
const initialBlog = require('../utils/initialBlog')

const nonExistingId = async () => {
  const blog = new Blog({ title: 'new blog' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlog, nonExistingId, blogInDb, usersInDb
}