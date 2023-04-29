export default ([r, g, b]) => {
    r /= 255 // Convert R to 0-1 range
    g /= 255 // Convert G to 0-1 range
    b /= 255 // Convert B to 0-1 range

    const max = Math.max(r, g, b) // Get max value of R, G, and B
    const min = Math.min(r, g, b) // Get min value of R, G, and B
    let h, s, l = (max + min) / 2 // Calculate H, S, and L

    if (max === min) h = s = 0 // If max and min are equal, H and S are 0
    else { // Otherwise
        const d = max - min // Calculate D

        s = l > 0.5 ? d / (2 - max - min) : d / (max + min) // Calculate S

        switch (max) { // Calculate H
            case r: h = (g - b) / d + (g < b ? 6 : 0) // If max is R, calculate H
                break
            case g: h = (b - r) / d + 2 // If max is G, calculate H
                break
            case b: h = (r - g) / d + 4 // If max is B, calculate H
                break
        }

        h /= 6 // Convert H to 0-1 range
    }

    return [h, s, l] // Return H, S, and L
}