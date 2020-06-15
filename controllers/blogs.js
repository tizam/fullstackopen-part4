const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user')
  res.json(blogs.map((blog) => blog.toJSON()))
})

blogRouter.post('/', async (req, res) => {
  const body = req.body
  const decodedToken = jwt.verify(req.token, process.env.SECRET)
  if (!req.token || !decodedToken.id) {
    return res.status(401).json({error: 'token missing or invalid'})
  }
  const user = await User.findById(decodedToken.id)

  console.log(req.token)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const result = await blog.save()
  user.blogs = user.blogs.concat(result)
  await user.save()
  res.status(201).json(result.toJSON())
})

blogRouter.put('/:id', async (req, res) => {
  const body = req.body

  const blog = {
    ...body,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
    new: true,
  })

  res.json(updatedBlog.toJSON())
})

blogRouter.delete('/:id', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET)
  if (!req.token || !decodedToken.id) {
    return res.status(401).json({error: 'token missing or invalid'})
  }

  const blog = await Blog.findById(req.params.id)
  const user = await User.findOne({username: decodedToken.username})

  if ( blog.user.toString() !== user._id.toString() ) {
    res.status(403).json({error: 'Unauthorized action'})
  }
  
  await blog.delete()
  res.status(204).end()
})

module.exports = blogRouter
