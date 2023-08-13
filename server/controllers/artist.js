import Artist from '../models/artist.js'

export const getArtist = async (req, res) => {
    try {
        const {id} = req.params // Get artist ID from request params

        if (!id) return res.status(400).json({ // If there is no artist ID, return 400 response
            status: 'ERROR',
            message: 'Artist ID is required.',
        })

        const artist = await Artist.findById(id) // Find artist from the artist id

        if (!artist) return res.status(404).json({ // If there is no artist, return 404 response
            status: 'ERROR',
            message: 'Artist not found.',
        })

        res.status(200).json({ // If there is an artist, return artist info
            status: 'OK',
            artist,
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving artist info.',
            error: e.message,
        })
    }
}

export const getArtistByGenre = async (req, res) => {
    try {
        const {genre} = req.params // Get genre from request params
        const {limit, sort = 'desc', includes = 'all'} = req.query // Get limit from query string

        if (!genre) return res.status(400).json({ // If there is no genre, return 400 response
            status: 'ERROR',
            message: 'Artist genre is required.',
        })

        const findParam = {genres: {[includes === 'all' ? '$all' : '$in']: genre.split(',')}} // Create find param based on includes query string
        const sortParam = {createdAt: sort === 'desc' ? -1 : 1} // Create sort param based on sort query string

        const artists = limit && !isNaN(Number(limit)) ? // If there is a limit query string, return artists with limit
            await Artist.find(findParam).sort(sortParam).limit(Number(limit)) :
            await Artist.find(findParam).sort(sortParam)

        res.status(200).json({ // Return artists
            status: 'OK',
            message: 'Artists data retrieved.',
            artists,
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving artist info.',
            error: e.message,
        })
    }
}

export const getArtists = async (req, res) => {
    try {
        const {cursor, limit, sorting, query} = req.query // Get cursor, limit and sorting from request query
        const artists = await Artist.find(
            query ? { // If there is a query, find artists with query
                $or: [
                    {name: {$regex: query, $options: 'i'}},
                    {description: {$regex: query, $options: 'i'}},
                    {genres: {$regex: query, $options: 'i'}},
                ],
            } : {} // Otherwise, find all artists
        ).sort( // Find artists and sort them
            sorting === 'last-created' ? {createdAt: -1} : // If sorting is last-created, sort by createdAt descending
                sorting === 'first-created' ? {createdAt: 1} : // If sorting is first-created, sort by createdAt ascending
                    null // Otherwise, do not sort
        ).skip(parseInt(cursor)).limit(parseInt(limit)) // Skip cursor and limit results

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Artists retrieved.',
            artists,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving artists.',
            error: e.message,
        })
    }
}