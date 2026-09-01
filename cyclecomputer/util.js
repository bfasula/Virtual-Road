export function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}
export function getGradeColor(grade) {
    // Define grade/color stops
    const stops = [
        { grade: -10, color: [0, 174, 239] },  // Blue
        { grade: 0,   color: [76, 175, 80] },   // Green
        { grade: 3,   color: [139, 195, 74] },  // Light green
        { grade: 6,   color: [255, 235, 59] },  // Yellow
        { grade: 9,   color: [255, 152, 0] },   // Orange
        { grade: 12,  color: [244, 67, 54] },   // Red
        { grade: 20,  color: [156, 0, 6] }      // Dark red
    ];

    // Clamp below minimum
    if (grade <= stops[0].grade) {
        return rgbToHex(stops[0].color);
    }

    // Clamp above maximum
    if (grade >= stops[stops.length - 1].grade) {
        return rgbToHex(stops[stops.length - 1].color);
    }

    // Find the two surrounding color stops
    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];

        if (grade >= start.grade && grade <= end.grade) {
            // Calculate position between stops (0.0 to 1.0)
            const t = (grade - start.grade) /
                      (end.grade - start.grade);

            // Interpolate RGB values
            const color = [
                Math.round(start.color[0] + (end.color[0] - start.color[0]) * t),
                Math.round(start.color[1] + (end.color[1] - start.color[1]) * t),
                Math.round(start.color[2] + (end.color[2] - start.color[2]) * t)
            ];

            return rgbToHex(color);
        }
    }
}

function rgbToHex(rgb) {
    return "#" + rgb
        .map(value => value.toString(16).padStart(2, "0"))
        .join("");
}

