export default genre => genre.split(' ').map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(' ')