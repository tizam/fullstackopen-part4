const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((accu, curr) => accu + curr.likes, 0) || 0
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const highestLikes = Math.max(...likes)
  const blogWithHighestLikes = blogs.find(blog => blog.likes === highestLikes)
  return {
    title: blogWithHighestLikes.title,
    author: blogWithHighestLikes.author,
    likes: blogWithHighestLikes.likes
  }
}

const mostBlogs = (blogs) => {
  // return _
  //     .chain(blogs)
  //     .countBy('author')
  //     .map((blogs, author) => ({ author, blogs }))
  //     .sortBy('blogs')
  //     .last()
  //     .value()
  const authors = blogs.map(blog => blog.author)
  const occurrences = authors.reduce((acc, current) => {
    !acc[current] ? acc[current] = 1 : acc[current]++
    return acc
  }, {})

  const sorted = Object.entries(occurrences).sort()

  const returnedObject = {
    author: sorted[sorted.length - 1][0],
    blogs: sorted[sorted.length - 1][1]
  }

  return returnedObject
}

const mostLikes = (blogs) => {
  return _.chain(blogs)
    .groupBy('author')
    .map((obj, key) => ({ 'author': key, 'likes': _.sumBy(obj, 'likes') }))
    .sortBy('likes')
    .last()
    .value()
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}