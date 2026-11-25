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
export function calcBearing(lat1, lon1, lat2, lon2) {
    const longitude1 = lon1;
    const longitude2 = lon2;
    const latitude1 = lat1 * Math.PI / 180;
    const latitude2 = lat2 * Math.PI / 180;
    const longDiff = (longitude2 - longitude1) * Math.PI / 180;
    const y = Math.sin(longDiff) * Math.cos(latitude2);
    const x = Math.cos(latitude1) * Math.sin(latitude2) - Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longDiff);

    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
export function calcWind(mph, bearing, windvelocity, winddirection) {
    const windalpha = Math.abs(bearing - winddirection);
    // console.log(`windvelo ${windvelocity.toFixed(1)} windalpha ${windalpha.toFixed(1)}`);
    const alpha = windalpha * Math.PI / 180;
    const windspeed = Math.sqrt(
        Math.pow(mph + windvelocity * Math.cos(alpha), 2) +
        Math.pow(windvelocity * Math.sin(alpha), 2)
    );
    // console.log(`windspeed ${windspeed.toFixed(1)} alpha ${alpha.toFixed(1)}`);

    return windspeed;
}

/*
For a bicycle, the wind you encounter is the apparent wind: the air’s velocity relative to your motion. This function returns its speed and the direction it’s coming from. Use the same speed units for bikeSpeed and windVelocity; bearings are degrees clockwise from north, and windDirection means where the wind comes from.
*/

function calculateApparentWind(bearing, bikeSpeed, windVelocity, windDirection) {
  const toRadians = degrees => (degrees * Math.PI) / 180;
  const toDegrees = radians => (radians * 180) / Math.PI;
  const normalize = degrees => ((degrees % 360) + 360) % 360;

  // Convert a speed and bearing into east/north components.
  const components = (speed, direction) => {
    const angle = toRadians(direction);
    return {
      east: speed * Math.sin(angle),
      north: speed * Math.cos(angle)
    };
  };

  // Wind direction is where it comes from, so air moves in the opposite direction.
  const air = components(windVelocity, normalize(windDirection + 180));
  const bike = components(bikeSpeed, bearing);

  // Air velocity relative to the moving bicycle.
  const east = air.east - bike.east;
  const north = air.north - bike.north;

  const speed = Math.hypot(east, north);
  const directionFrom = normalize(toDegrees(Math.atan2(-east, -north)));

  return { speed, directionFrom };
}

// Cycling north at 20 km/h, with a 10 km/h wind from the north:
//console.log(calculateApparentWind(0, 20, 10, 0));
// { speed: 30, directionFrom: 0 }


/*
To estimate steady-state bicycle speed from power, you also need rider+bike mass, aerodynamic drag area (CdA), rolling resistance, and drivetrain efficiency. This model assumes a straight road and uses only the wind component along your direction of travel.
Convert wind speed to m/s before passing it in (km/h ÷ 3.6). The result is an estimate: riding position, tires, road surface, and gusts can noticeably affect actual speed.
*/

export function bicycleSpeed({
  watts,          // Rider power at the cranks, W
  grade,          // Decimal: 5% uphill = 0.05; 1% downhill = -0.01
  headwind = 0,   // Wind component along your travel direction, m/s
                  // Positive = headwind; negative = tailwind
  mass,           // Rider + bicycle, kg
  cda,            // Drag area, m² (Cd × frontal area)
  crr = 0.005,    // Rolling-resistance coefficient
  efficiency = 0.97,
  airDensity = 1.225 // kg/m³
}) {
  if (watts <= 0 || mass <= 0 || cda < 0 || crr < 0 ||
      efficiency <= 0 || efficiency > 1) {
    throw new Error("Check watts, mass, cda, crr, and efficiency.");
  }

  const g = 9.80665;
  const sinSlope = grade / Math.sqrt(1 + grade * grade);
  const cosSlope = 1 / Math.sqrt(1 + grade * grade);
  const wheelPower = watts * efficiency;

  function powerRequired(speed) {
    const gravityForce = mass * g * sinSlope;
    const rollingForce = crr * mass * g * cosSlope;

    // Signed drag lets a sufficiently strong tailwind assist the bicycle.
    const relativeAirSpeed = speed + headwind;
    const aeroForce =
      0.5 * airDensity * cda *
      relativeAirSpeed * Math.abs(relativeAirSpeed);

    return (gravityForce + rollingForce + aeroForce) * speed;
  }

  // Find a speed range that brackets the power-balance solution.
  let low = 0;
  let high = 5; // m/s
  while (powerRequired(high) < wheelPower && high < 60) {
    high *= 2;
  }
  if (high >= 60 && powerRequired(high) < wheelPower) {
    throw new Error("Could not find a speed solution within the search range.");
  }

  // Bisection search for the steady-state speed.
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    if (powerRequired(mid) < wheelPower) low = mid;
    else high = mid;
  }

  const speedMps = (low + high) / 2;
  return {
    metersPerSecond: speedMps,
    kilometersPerHour: speedMps * 3.6,
    milesPerHour: speedMps * 2.23694
  };
}

// Example: 200 W, 80 kg total, flat road, 5 m/s headwind
/*
console.log(bicycleSpeed({
  watts: 200,
  grade: 0,
  headwind: 5,
  mass: 80,
  cda: 0.32
}));
*/

/*
It only seems circular because there are two different meanings of “headwind.” The ambient wind’s headwind component depends on the wind and your route bearing—not your bicycle speed. The apparent wind you feel does depend on your speed, and the speed calculation accounts for that internally.

Calculate the ambient headwind component first:

js

Here, windDirection is where the wind comes from, and all speeds must use the same units. A positive result is a headwind; a negative result is a tailwind. For example, traveling north (bearing: 0) with a 10 m/s wind from the north gives a 10 m/s headwind.

Pass that result as headwind to bicycleSpeed. Inside the speed calculation, the relative airflow is modeled as bikeSpeed + headwind, so the effect of your speed on apparent wind is included without needing to calculate it beforehand.
*/

export function headwindComponent(bearing, windVelocity, windDirection) {
  const radians = Math.PI / 180;
  return windVelocity * Math.cos((windDirection - bearing) * radians);
}
export function sampleWindSpeed(k, lambda) {
  const u = Math.random();
  return lambda * Math.pow(-Math.log(1 - u), 1 / k);
}
export function simulateWindDirection(meanDegrees, spreadDegrees = 25) {
  // Gaussian random variation (Box–Muller transform)
  const u1 = Math.random();
  const u2 = Math.random();
  const normal =
    Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  return (meanDegrees + normal * spreadDegrees + 360) % 360;
}

// Example: wind generally comes from the west, varying by about 25°
//const direction = simulateWindDirection(270, 25);


//console.log(randomNormal(2, 5)); // mean 2, standard deviation 5
export function randomNormal(mean = 0, sd = 1) {
  const u1 = Math.random();
  const u2 = Math.random();

  const z = Math.sqrt(-2 * Math.log(u1)) *
            Math.cos(2 * Math.PI * u2);

  return mean + sd * z;
}
