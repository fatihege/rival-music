export default (seconds) => {
    const minutes = Math.floor(seconds / 60) // Get minutes
    const hours = Math.floor(minutes / 60) // Get hours

    const secondsString = seconds % 60 < 10 ? `0${Math.floor(seconds % 60)}` : Math.floor(seconds % 60) // Get seconds (with leading zero)
    const minutesString = minutes % 60 < 10 ? `0${Math.floor(minutes % 60)}` : Math.floor(minutes % 60) // Get minutes (with leading zero)
    const hoursString = hours % 24 < 10 ? `0${Math.floor(hours % 24)}` : Math.floor(hours % 24) // Get hours (with leading zero)

    return hours ? `${hoursString}:${minutesString}:${secondsString}` : `${minutesString}:${secondsString}` // Return formatted time
}