export default duration => {
    if (!duration) return 0 // If duration is not defined, return 0
    const [minutes, seconds, milliseconds] = duration.split(':') // Split duration to minutes, seconds and milliseconds
    return (parseInt(minutes) * 60 + parseInt(seconds)) * 1000 + parseInt(milliseconds) // Return duration in milliseconds
}