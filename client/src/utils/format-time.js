export default (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    const secondsString = seconds % 60 < 10 ? `0${Math.floor(seconds % 60)}` : Math.floor(seconds % 60)
    const minutesString = minutes % 60 < 10 ? `0${Math.floor(minutes % 60)}` : Math.floor(minutes % 60)
    const hoursString = hours % 24 < 10 ? `0${Math.floor(hours % 24)}` : Math.floor(hours % 24)

    return hours ? `${hoursString}:${minutesString}:${secondsString}` : `${minutesString}:${secondsString}`
}