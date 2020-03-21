const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blog) => {
    return blog[0].likes
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

        // console.log("acc", acc);
        // console.log('current', current)
        // console.log(acc[current])
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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}