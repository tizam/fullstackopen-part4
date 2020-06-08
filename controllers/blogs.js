const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (req, res) => {
	const blogs = await Blog.find({})
	res.json(blogs.map((blog) => blog.toJSON()))
})

blogRouter.post('/', async (req, res) => {
	const blog = new Blog(req.body)
	const result = await blog.save()
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
	await Blog.findByIdAndRemove(req.params.id)
	res.status(204).end()
})

module.exports = blogRouter
