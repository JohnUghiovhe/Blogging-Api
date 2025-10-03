function calculateReadingTime(text) {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.trim().split(/\s+/).length; // Split text into words
    const minutes = Math.ceil(words / wordsPerMinute); // Calculate reading time
    return `${minutes} min read`; // Return reading time as a string
}

module.exports = { calculateReadingTime };