export class SystemInfo{
    name = "Celo System"
    axisDuo = 23
    dayLength = 28
    yearLength = 432
    epoch = 2451545.0
    massDuo = 7.1664e24
    massAur = 2.25e30
    massGla = 3.75e30
    radiusDuo = 6628
    distBaryDuo = 132e6
    distBaryAur
    distBaryGla
    distStars
    starAurPosition
    starGlaPosition
    orbitEccentricity = 0.4
    orbitInclination = 0

    moons = [
        new Moon("Lythos", 7.35e22, 3200, 3, 400000, 0, 0, 0, 0, "Superficie rocciosa, ricca di minerali radioattivi.", "#46382F"),
        new Moon("Nyx", 3.675e22, 3800, 28, 1200000, 10, 0.5, 100, 100, "Atmosfera densa, ricca di azoto e metano, superficie oscura.", "#1A1A1A"),
        new Moon("Prisma", 1.47e22, 3400, 7, 500000, 15, 0.1, 0, 0, "Superficie ghiacciata, con prismi di ghiaccio che riflettono la luce delle stelle.", "#B0E0E6"),
        new Moon("Vulkan", 2.205e22, 3200, 48.8, 600000, -100, 0.3, 80, 90, "Superficie vulcanica, con frequenti eruzioni.", "#D46A6A")
    ];

    moonByName(name){
        return this.moons.find(moon => moon.name.toLowerCase() == name.toLowerCase())
    }

    lowerCaseMoonsList(){
        return this.moons.map(moon => moon.name.toLowerCase())
    }

    constructor() {
        this.distBaryAur = this.distBaryDuo * (this.massAur / (this.massDuo + this.massAur + this.massGla));
        this.distBaryGla = this.distBaryDuo * (this.massGla / (this.massDuo + this.massAur + this.massGla));
        this.distStars = this.distBaryAur + this.distBaryGla;
        this.starAurPosition = { x: 0, y: this.distBaryAur, z: 0 }; // Example: Aur on the y-axis
        this.starGlaPosition = { x: 0, y: -this.distBaryGla, z: 0 }; // Example: Gla on the negative y-axis

    }
}

export class Planet{

}

export class Moon{
    constructor(name, mass, diameter, orbitalPeriod, distanceFromDuoceli, inclination, eccentricity, longitudeOfAscendingNode, argumentOfPerigee, features, color) {
        this.name = name;
        this.mass = mass; // in kg
        this.diameter = diameter; // in km
        this.orbitalPeriod = orbitalPeriod; // in giorni terrestri
        this.distanceFromDuoceli = distanceFromDuoceli; // in km
        this.inclination = inclination; // in gradi
        this.eccentricity = eccentricity;
        this.longitudeOfAscendingNode = longitudeOfAscendingNode; // in gradi
        this.argumentOfPerigee = argumentOfPerigee; // in gradi
        this.features = features;
        this.color = color;
    }
}

export class SystemPos{
    t
    distFromBarycenter
    eccentricAnomaly
    trueAnomaly
    distFromAurum
    distFromGlaucus
    moonsPos = []

    constructor(t, distFromBarycenter, eccentricAnomaly, trueAnomaly, x, y, z, distFromAurum, distFromGlaucus, moonsPos){
        this.t = t
        this.distFromBarycenter = distFromBarycenter
        this.eccentricAnomaly = eccentricAnomaly
        this.trueAnomaly = trueAnomaly
        this.x = x
        this.y = y
        this.z = z
        this.distFromAurum = distFromAurum
        this.distFromGlaucus = distFromGlaucus
        this.moonsPos = moonsPos
    }

    moonByName(name){
        return this.moonsPos.find(moon => moon.name.toLowerCase() == name.toLowerCase())
    }
}

export function distanceCalc(t){

    const System = new SystemInfo
    const {name, axisDuo, dayLength, yearLength, massDuo, massAur, massGla, distBaryDuo, distBaryAur, distBaryGla, distStars, orbitEccentricity, moons} = System
    let moonsPos = []

    // Calculate eccentric anomaly (E) from true anomaly (nu)
    const E = eccentricAnomalyCalc(t, orbitEccentricity, yearLength);

    // Calculate true anomaly (nu) from eccentric anomaly (E)
    const nu = trueAnomalyCalc(t, E, orbitEccentricity);

    // Calculate distance from the star (r)
    // r = a * (1 - e * cos(E))
    const rDuo = distBaryDuo * (1 - orbitEccentricity * Math.cos(E));
    // rAur = distBaryAur * (1 - e * Math.cos(E1))
    // rGla = aGla * (1 - e * Math.cos(E2))
    const rAur = Math.sqrt(rDuo * rDuo + distBaryAur * distBaryAur - 2 * distBaryAur * rDuo * Math.cos(nu));
    const degAu = (rAur * rAur + distBaryAur * distBaryAur - rDuo * rDuo) / (2 * rAur * distBaryAur);
    // rAur = distBaryAur * (1 - e * Math.cos(E1))
    // rGla = Math.sqrt(rDuo * rDuo + aGla * aGla - 2 * rDuo * aGla * Math.cos(nu2))
    // rGla = aGla * (1 - e * Math.cos(E2))
    const rGla = Math.sqrt(rAur * rAur + distStars * distStars - 2 * rAur * distStars * degAu);

    // Assuming a 2D coordinate system for now, with z being 0
    const x = rDuo * Math.cos(nu);
    const y = rDuo * Math.sin(nu);
    const z = rDuo * Math.sin(degToRad(System.orbitInclination)) * Math.sin(nu);

    if(moons != null){
        for(let i = 0; i < moons.length; i++){
            let moon = moons[i]
            let moonPos = calculateMoonPosition(moon, t)
            moonsPos.push(moonPos)
        }
    }

    return new SystemPos(t, rDuo, E, nu, x, y, z, rAur, rGla, moonsPos);
}

// anomalia eccentrica (posizione del punto rispetto all'ellisse, radians)
export function eccentricAnomalyCalc(t, e, orbitDuration) {

    // moto medio
    const n = 2 * Math.PI / orbitDuration

    // anomalia media (posizione del punto rispetto all'orbita, radians)
    /* The mean anomaly (M) is related to the time and orbital period of the body around the star.
     Kepler's laws can be used to calculate the mean anomaly for a given time. */
    const M = n * t;

    /*
     Calculates the eccentric anomaly (E) from the mean anomaly (M) using iterative method.

     Args:
       M: Mean anomaly in radians.
       e: Eccentricity of the ellipse.

     Returns:
       Eccentric anomaly in radians.
     */
    let E = M;
    while (Math.abs(E - M - e * Math.sin(E)) > 1e-6) {
        // E = M + e * Math.sin(E);
        E = E - (E - M - e * Math.sin(E)) / (1 -e * Math.cos(E));

    }
    return E;
}

export function trueAnomalyCalc(t, E, orbitEccentricity) {
    // Calculate true anomaly (nu) from eccentric anomaly (E)
    return 2 * Math.atan(Math.sqrt((1 + orbitEccentricity) / (1 - orbitEccentricity)) * Math.tan(E / 2));
}

export function calculateDaylightHoursForSection(t, sectionIndex, N) {
    const systemInfo = new SystemInfo();
    console.log("Error check start")
    const planetPos = distanceCalc(t); // Get planet's position

    console.log("1) Planet position:", planetPos);
    // Calculate planet's orientation based on planetPos and axisDuo
    const planetOrientation = calculatePlanetOrientation(t, planetPos, systemInfo.axisDuo);

    console.log("2) Planet orientation (error before here):", planetOrientation);

    const sectionLongitude = (sectionIndex / N) * 360; // Calculate longitude for the specified section
    const sunlightAngle = calculateSunlightAngle(planetPos, sectionLongitude);
    console.log("3) Sunlight angle:", sunlightAngle);

    const daylightHours = calculateSectionDaylight(sunlightAngle, systemInfo.dayLength);
    console.log("4) Daylight hours:", daylightHours);

    return daylightHours;
}

// export function calculateDaylightHours(t, N) {
//     const systemInfo = new SystemInfo();
//     const planetPos = distanceCalc(t); // Get planet's position
//
//     // Calculate planet's orientation based on planetPos and axisDuo
//     const planetOrientation = calculatePlanetOrientation(t, planetPos, systemInfo.axisDuo);
//
//     let totalDaylightHours = 0;
//     for (let i = 0; i < N; i++) {
//         const sectionLongitude = (i / N) * 360; // Assuming equal section sizes
//         const sunlightAngle = calculateSunlightAngle(planetOrientation, sectionLongitude);
//
//         if (sunlightAngle < 90) {
//             // Calculate daylight hours for the section based on sunlightAngle
//             const sectionDaylightHours = calculateSectionDaylight(sunlightAngle, systemInfo.dayLength);
//             totalDaylightHours += sectionDaylightHours;
//         }
//     }
//
//     return totalDaylightHours;
// }
export function calculateDaylightHours(latitude, longitude, t) {
    const defaultRefraction = -0.83
    const System = new SystemInfo();

// Calculate planet's position
    const planetPos = distanceCalc(t);
    console.log(" !!! Planet position:", planetPos);
// Calculate Sun's position (right ascension, declination)
    const sunPosition = calculateSunPosition(planetPos);
    console.log(" !!! Sun position:", sunPosition);

// Convert to horizontal coordinates (altitude, azimuth)
    const sunCoordinates = convertToHorizontalCoordinates(t, latitude, longitude, sunPosition);
    console.log(" !!! Sun coordinates:", sunCoordinates);

// Determine sunrise and sunset times
    const sunriseTime = calculateSunriseTime(t, sunCoordinates, latitude, longitude, defaultRefraction, sunPosition);
    const sunsetTime = calculateSunsetTime(t, sunCoordinates, latitude, longitude, defaultRefraction, sunPosition);
    console.log(" !!! Sunrise time:", sunriseTime);
    console.log(" !!! Sunset time:", sunsetTime);

// Calculate daylight hours
//     const daylightHours = (Math.abs(sunsetTime.hours)+System.dayLength/2 - sunriseTime.hours) + (sunsetTime.minutes - sunriseTime.minutes)/60;
    const daylightHours = (sunsetTime.hours - sunriseTime.hours) + (sunsetTime.minutes - sunriseTime.minutes)/60;
    console.log(" !!! Daylight hours:", daylightHours);

    return daylightHours;
}

function calculateSectionDaylight(sunlightAngle, dayLength) {
    // Assuming sunlightAngle is in degrees

    // Convert dayLength to hours
    const hoursPerDay = dayLength;

    // Calculate the time when sunlight starts (in hours)
    const sunriseAngle = 90; // Assuming sunrise when sunlight angle is 270 degrees
    const sunriseTime = (sunriseAngle - sunlightAngle) / 360 * hoursPerDay;

    // Calculate the time when sunlight ends (in hours)
    const sunsetAngle = 90; // Assuming sunset when sunlight angle is 90 degrees
    const sunsetTime = (sunlightAngle - sunsetAngle) / 360 * hoursPerDay;

    console.log("12) Sunrise time:", dayToHours(sunriseTime) + ":" + dayToMinutes(sunriseTime));
    console.log("13) Sunset time:", dayToHours(sunsetTime) + ":" + dayToMinutes(sunsetTime));
    // Calculate daylight duration (in hours)
    const daylightHours = sunsetTime - sunriseTime;

    return daylightHours;
}

export function dayToHours(day) {
    let System = new SystemInfo();
    return Math.floor(day%1 * System.dayLength);
}
export function dayToMinutes(day) {
    let System = new SystemInfo();
    return Math.floor((day%1 * System.dayLength)%1 * 60);
}
export function hoursToMinutes(hours) {
    return Math.floor(hours%1 * 60);
}

export function calculateSunlightAngle(planetPosition, sectionLongitude, latitude = 0) {
    // Assuming planetOrientation contains necessary data like inclination, obliquity, rotation
    const System = new SystemInfo();

    // Calculate the vector pointing from the planet's center to the star
    const starVector = calculateStarVector(System.starAurPosition, planetPosition); // Assuming a function to calculate this
    console.log("5) Star vector:", starVector);
    // Calculate the normal vector to the surface at the given section
    const normalVector = calculateNormalVector(latitude, sectionLongitude); // Assuming a function to calculate this
    // Calculate the angle between the two vectors
    const dotProduct = starVector.x * normalVector.x + starVector.y * normalVector.y + starVector.z * normalVector.z;
    const magnitudeStarVector = Math.sqrt(starVector.x * starVector.x + starVector.y * starVector.y + starVector.z * starVector.z);
    const magnitudeNormalVector = Math.sqrt(normalVector.x * normalVector.x + normalVector.y * normalVector.y + normalVector.z * normalVector.z);
    const cosTheta = dotProduct / (magnitudeStarVector * magnitudeNormalVector);
    const sunlightAngle = Math.acos(cosTheta) * (180 / Math.PI); // Convert to degrees

    return sunlightAngle;
}

export function calculateSunPosition(duoPos) {
    let ecl = calculateEclipticCoordinates(duoPos);
    console.log(" !!! Ecliptic coordinates:", ecl);
    return convertEclipticToEquatorialCoordinates(ecl);
}

export function calculateEclipticCoordinates(duoPos) {
    console.log(" !!! Duo Position:", duoPos);
    const System = new SystemInfo();
    const eclipticLongitude = Math.atan2(duoPos.y, duoPos.x);
    const eclipticLatitude = approximateEclipticLatitude(duoPos.z);

    return {
        longitude: radToDeg(eclipticLongitude),
        latitude: eclipticLatitude
    };
}
export function approximateEclipticLatitude(z) {
    const System = new SystemInfo();
    return Math.asin(z / System.distBaryDuo) * 180 / Math.PI * System.axisDuo;

}
export function convertEclipticToEquatorialCoordinates(eclipticCoordinates) {
    const { longitude, latitude } = eclipticCoordinates;
    const obliquity = 23.4392911 // degrees, approximate value

    // Convert angles to radians
    const L = longitude * Math.PI / 180;
    const B = latitude * Math.PI / 180;
    const epsilon = obliquity * Math.PI / 180;

    // Calculate right ascension and declination
    const rightAscension = Math.atan2(Math.sin(L) * Math.cos(epsilon) - Math.tan(B) * Math.sin(epsilon), Math.cos(L));
    const declination = Math.asin(Math.sin(B) * Math.cos(epsilon) + Math.cos(B) * Math.sin(epsilon) * Math.sin(L));

    // Convert angles back to degrees
    const RA = rightAscension * 180 / Math.PI;
    const dec = declination * 180 / Math.PI;

    return { rightAscension: RA, declination: dec };
}
export function convertToHorizontalCoordinates(t, latitude, longitude, sunPosition) {
    const { rightAscension, declination } = sunPosition;

    // Convert angles to radians
    const RA = rightAscension * Math.PI / 180;
    const dec = declination * Math.PI / 180;
    const lat = latitude * Math.PI / 180;
    const long = longitude * Math.PI / 180;

    // Calculate local sidereal time (LST)
    // You'll need to implement this function based on your time zone handling
    const LST = calculateLocalSiderealTime(t, longitude); // Replace with your LST calculation

    // Calculate hour angle (H)
    const H = LST - RA;

    // Calculate altitude (Alt) and azimuth (Az)
    const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
    const alt = Math.asin(sinAlt);
    const cosAz = (Math.sin(lat) - Math.sin(alt) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(alt));
    const sinAz = Math.cos(dec) * Math.sin(H) / Math.cos(alt);
    const az = Math.atan2(sinAz, cosAz);

    // Convert angles back to degrees
    const altitude = alt * 180 / Math.PI;
    const azimuth = az * 180 / Math.PI;

    return { altitude, azimuth };
}
export function calculateLocalSiderealTime(t, longitude) {
    const System = new SystemInfo();

    // Calculate Greenwich Mean Sidereal Time (GMST)
    //const GMST = calculateGMST(julianDay);
    const MST = getMeanSiderealTime(t, longitude);

    // Convert longitude to radians
    const longRad = longitude * Math.PI / 180;

    // Calculate Local Mean Sidereal Time (LMST)
    //const LMST = GMST + longRad / 24; // Convert longitude to hours
    let LMST = MST + longRad / System.dayLength; // Convert longitude to hours

    // Handle LMST greater than 24 hours
    if (LMST > System.dayLength) {
        LMST -= System.dayLength;
    }

    return LMST;
}
function getMeanSiderealTime(t, longitude) {
    const System = new SystemInfo();

    // Fictional system parameters
    const rotationPeriodHours = System.dayLength; // hours
    const orbitalPeriodDays = System.yearLength;
    const axialTilt = System.axisDuo; // degrees
    const epoch = System.epoch;

    // Calculate days since a reference epoch (adjust as needed)
    const daysSinceEpoch = t - epoch; // Replace with your epoch

    // Calculate sidereal days
    const siderealDays = daysSinceEpoch * (orbitalPeriodDays / (orbitalPeriodDays - 1)); // Adjust for fictional system

    // Convert sidereal days to hours
    const siderealHours = siderealDays * rotationPeriodHours;

    // Calculate GMST (simplified, without considering nutation, precession, etc.)
    const gmst = siderealHours % rotationPeriodHours;

    // Calculate MST
    const mst = (gmst + longitude) % rotationPeriodHours;

    return mst;
}
export function calculateSunriseTime(t, sunCoordinates, latitude, longitude, refraction = -0.83, sunPosition) {
    const { altitude, azimuth } = sunCoordinates;
    const lat = latitude * Math.PI / 180;

    // Convert altitude to radians
    const alt = (altitude + refraction) * Math.PI / 180;
    const dec = sunPosition.declination * Math.PI / 180;

    // Calculate hour angle (H) for sunrise
    const cosH = (Math.sin(alt) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec));
    const H = Math.acos(cosH);


    const lst = calculateLocalSiderealTime(t, longitude);
    const localTime = hourAngleToTime(H, lst);

    console.log("SUNRISE !!! altitude = " +altitude);
    console.log("SUNRISE !!! alt = " +alt);
    console.log("SUNRISE !!! latitude = " +latitude);
    console.log("SUNRISE !!! lat = " +lat);
    console.log("SUNRISE !!! declination = " +sunPosition.declination);
    console.log("SUNRISE !!! dec = " +dec);
    console.log("SUNRISE !!! cosH = " + cosH);
    console.log("SUNRISE !!! H = " + H);
    console.log("SUNRISE !!! sunrise time = " + localTime.hours + ":" + localTime.minutes + ":" + localTime.seconds);
    // Convert hour angle to time
    // ... (calculations involving local sidereal time, time zone, etc.)
    // Return sunrise time
    return localTime;
}
export function calculateSunsetTime(t, sunCoordinates, latitude, longitude, refraction = -0.83, sunPosition) {
    const { altitude, azimuth } = sunCoordinates;
    const lat = latitude * Math.PI / 180;

    // Convert altitude to radians
    const alt = (altitude + refraction) * Math.PI / 180;
    const dec = sunPosition.declination * Math.PI / 180;

    // Calculate hour angle (H) for sunset
    const cosH = (Math.sin(alt) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec));
    const H = -Math.acos(cosH); // Negative sign for sunset

    const lst = calculateLocalSiderealTime(t, longitude);
    const localTime = hourAngleToTime(H, lst);



    console.log("SUNSET !!! altitude = " +altitude);
    console.log("SUNSET !!! alt = " +alt);
    console.log("SUNSET !!! latitude = " +latitude);
    console.log("SUNSET !!! lat = " +lat);
    console.log("SUNSET !!! declination = " +sunPosition.declination);
    console.log("SUNSET !!! dec = " +dec);
    console.log("SUNSET !!! cosH = " + cosH);
    console.log("SUNSET !!! H = " + H);
    console.log("SUNSET !!! sunseet time = " + localTime.hours + ":" + localTime.minutes + ":" + localTime.seconds);

    // Convert hour angle to time
    // ... (calculations involving local sidereal time, time zone, etc.)
    return localTime;
}
// export function hourAngleToTime(hourAngle) {
//     const System = new SystemInfo();
//     // console.log(" !!! hourAngle = " + hourAngle);
//     // Convert hour angle to degrees if it's in radians
//     if (typeof hourAngle === 'number') {
//         hourAngle *= 180 / Math.PI;
//     }
//     // console.log(" !!! hourAngle2 = " + hourAngle);
//
//     // Convert to hours
//     const hours = hourAngle / (360/System.dayLength);
//
//     // Extract hours, minutes, and seconds
//     const hoursInt = Math.floor(hours);
//     const minutes = (hours - hoursInt) * 60;
//     const minutesInt = Math.floor(minutes);
//     const seconds = (minutes - minutesInt) * 60;
//
//     const hours2 = Math.floor(hourAngle);
//     const minutes2 = Math.floor((hourAngle - hours) * 60);
//     const seconds2 = Math.round(((hourAngle - hours) * 60 - minutes) * 60);
//
//     // Format the time as you prefer, e.g.,
//     console.log( `${Math.abs(hours)}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${hours >= 0 ? 'E' : 'W'}`);
//
//
//     return { hours: hoursInt, minutes: minutesInt, seconds: seconds };
// }
export function hourAngleToTime(hourAngle, lst) {
    //assuming lst is provided in hours
    const System = new SystemInfo();

    // Convert hour angle to degrees if it's in radians
    if (typeof hourAngle === 'number') {
        hourAngle *= 180 / Math.PI;
    }

    // Convert hour angle to hours
    const hourAngleInHours = hourAngle / (360/System.dayLength); // 360 degrees in a day, 15 degrees per hour

    // Calculate local time in hours
    let localTimeHours = lst + hourAngleInHours;

    // Handle wraparound for values greater than 24
    while (localTimeHours >= System.dayLength) {
        localTimeHours -= System.dayLength;
    }

    // Convert hours to hours, minutes, and seconds
    const hours = Math.floor(localTimeHours);
    const minutes = Math.floor((localTimeHours - hours) * 60);
    const seconds = Math.round((localTimeHours - hours - minutes / 60) * 3600);

    return { hours, minutes, seconds };
}

export function calculateNormalVector(latitude, longitude) {
    const System = new SystemInfo();
    const radius = System.radiusDuo; // Assuming radiusDuo is the planet's radius
    const phi = latitude * (Math.PI / 180); // Convert latitude to radians
    const theta = longitude * (Math.PI / 180); // Convert longitude to radians

    const x = radius * Math.cos(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) * Math.sin(theta);
    const z = radius * Math.sin(phi);

    const length = Math.sqrt(x * x + y * y + z * z);
    const normalVector = {
        x: x / length,
        y: y / length,
        z: z / length
    };

    return normalVector;
}

export function calculateStarVector(starPosition, planetPos) {
    console.log("6) Planet position:", planetPos);
    // Assuming planetPos contains x, y, z coordinates relative to the barycenter
    const planetVector = {
        x: planetPos.x,
        y: planetPos.y,
        z: planetPos.z
    };

    console.log("7) Planet vector:", planetVector);

    // Assuming star position is relative to the barycenter
    const starVector = {
        x: starPosition.x,
        y: starPosition.y,
        z: starPosition.z
    };

    console.log("8) Star vector:", starVector);
    const starToPlanetVector = {
        x: starVector.x - planetVector.x,
        y: starVector.y - planetVector.y,
        z: starVector.z - planetVector.z
    };

    console.log("9) Star to planet vector:", starToPlanetVector);

    return starToPlanetVector;
}

export function calculatePlanetOrientation(t, planetPos, axisDuo) {
    const { trueAnomaly } = planetPos; // Extract true anomaly

    console.log("10) Nu:", trueAnomaly);
    // Calculate rotation angle based on elapsed time (implement this)
    const rotationAngle = calculateRotationAngle(t); // Assuming t is provided

    // Create a rotation matrix for axial tilt
    const tiltMatrix = createTiltMatrix(axisDuo);

    // Create a rotation matrix for orbital position
    const orbitMatrix = createOrbitMatrix(trueAnomaly);

    // Combine rotation matrices
    const orientationMatrix = multiplyMatrices(orbitMatrix, tiltMatrix);

    return orientationMatrix;
}

export function calculateRotationAngle(t) {
    const systemInfo = new SystemInfo();
    return (t / systemInfo.dayLength) * 360; // Assuming rotation starts at 0 degrees
}

export function createTiltMatrix(axisDuo) {
    const angle = axisDuo * (Math.PI / 180); // Convert to radians
    return [
        [1, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]
    ];
}

export function createOrbitMatrix(nu) {
    const angle = nu * (Math.PI / 180);
    return [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]
    ];
}

export function multiplyMatrices(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}



export function radToDeg(radians) {
    // Store the value of pi.
    var pi = Math.PI;
    // Multiply radians by 180 divided by pi to convert to degrees.
    return radians * (180/pi);
}
export function degToRad(deg) {
    // Store the value of pi.
    var pi = Math.PI;
    // Multiply degrees by pi divided by 180 to convert to radians.
    return deg * pi/180;
}

export function rotateCoordinates(x_prime, y_prime, inclinationRadians) {
    const cosInclination = Math.cos(inclinationRadians);
    const sinInclination = Math.sin(inclinationRadians);
    const rotatedX = x_prime * cosInclination - y_prime * sinInclination;
    const rotatedY = x_prime * sinInclination + y_prime * cosInclination;
    return { x: rotatedX, y: rotatedY };
}


export function calculateMoonOrbitApproximation(t, moon, scaleFactor, canvasW, canvasH) {
    const moonInfo = new SystemInfo().moonByName(moon.name);


    // Calculate eccentric anomaly (E) from true anomaly (nu)
    const E = eccentricAnomalyCalc(t, moonInfo.eccentricity, moonInfo.orbitalPeriod);

    // Calculate true anomaly (nu) from eccentric anomaly (E)
    const nu = trueAnomalyCalc(t, E, moonInfo.eccentricity);


    // Calcolo della distanza dalla luna a Duoceli
    const r = moon.distanceFromDuoceli * (1 - moon.eccentricity * Math.cos(E));
    // convert degrees to radians
    const perigee = degToRad(moonInfo.argumentOfPerigee);
    const longAscendingNode = degToRad(moonInfo.longitudeOfAscendingNode);

    // Calculate angle in orbit plane (theta) considering argumentOfPerigee
    const theta = nu + perigee;

    // Apply rotations for longitudeOfAscendingNode and inclination (i)
    const incl = degToRad(moonInfo.inclination);

    // let x, y, z

    // Rotate around Z-axis for longitudeOfAscendingNode
    const x_prime = Math.cos(longAscendingNode) * Math.cos(theta) - Math.sin(longAscendingNode) * Math.sin(theta);
    const y_prime = Math.sin(longAscendingNode) * Math.cos(theta) + Math.cos(longAscendingNode) * Math.sin(theta);

    // if (moon.name === "Prisma" || moon.name === "Nyx") {
    //     // console.log("Moon name:"+ moon.name);
    //     // console.log("Before rotation: x_prime =", x_prime, "y_prime =", y_prime);
    //     // console.log("Inclination:", incl);
    // }
    // // Rotate around X-axis for inclination
    // x = x_prime;
    // y = y_prime * Math.cos(incl) -/* (moonInfo.distanceFromDuoceli*scaleFactor) **/ Math.sin(incl); // Use distance directly
    // z = y_prime * Math.sin(incl) +/* (moonInfo.distanceFromDuoceli*scaleFactor) **/ Math.cos(incl);
    // if (moon.name === "Prisma" || moon.name === "Nyx") {
    //     // console.log("After rotation: x =", x, "y =", y, "z =", z);
    // }

    const { x, y } = rotateCoordinates(x_prime, y_prime, incl);

    // Calculate screen position based on rotated coordinates
    const rMoon = moonInfo.distanceFromDuoceli; // distance from Duoceli (already calculated)
    const xMoon = rMoon/* * 2.70*/ * x * scaleFactor + canvasW / 2;
    const yMoon = rMoon/* * 0.85*/ * y * scaleFactor + canvasH / 2;

    // const rMoon = moonInfo.distanceFromDuoceli * (1 - (moonInfo.eccentricity) * Math.cos(nu));
    // const xMoon = rMoon * Math.cos(nu) * 2.70 + padding/10;
    // const yMoon = rMoon * Math.sin(nu) * 0.85;

    // Scale the position to fit the canvas and offset it to the center
    const scaledXMoon = xMoon * scaleFactor + canvasW / 2;
    const scaledYMoon = yMoon * scaleFactor + canvasH / 2;

    return { x: xMoon, y: yMoon };

    // return { x: scaledXMoon, y: scaledYMoon };
}

export function calculateOrbitApproximation(trueAnomaly, orbitDistance, orbitEccentricity, scaleFactor, canvasW, canvasH, padding, extraBias) {
    const angleInRadians = trueAnomaly * Math.PI / 180;
    const rDuo = orbitDistance * (1 - (orbitEccentricity) * Math.cos(angleInRadians));
    const xDuo = rDuo * Math.cos(angleInRadians) * 2.20 + padding/10;
    const yDuo = rDuo * Math.sin(angleInRadians) * 0.85;

    // Scale the position to fit the canvas and offset it to the center
    const scaledXDuo = xDuo * scaleFactor + canvasW / 2 + extraBias;
    const scaledYDuo = yDuo * scaleFactor + canvasH / 2;


    return { x: scaledXDuo, y: scaledYDuo };
}

export function calculateMoonPosition(moon, time) {
    // Costanti fondamentali
    const name = moon.name
    const G = 6.6743e-11; // Costante gravitazionale universale
    const dayToSeconds = 86400; // Secondi in un giorno
    const hourToSeconds = 3600; // Secondi in un'ora

    // Calcoli preliminari
    const n = 2 * Math.PI / (moon.orbitalPeriod * dayToSeconds); // Moto medio
    const M = n * time * dayToSeconds; // Anomalia media

    // Calcolo dell'anomalia eccentrica (metodo iterativo di Newton-Raphson)
    let E = M;
    for (let i = 0; i < 10; i++) {
        E = E - (E - M - moon.eccentricity * Math.sin(E)) / (1 - moon.eccentricity * Math.cos(E));
    }

    // Calcolo dell'anomalia vera
    const nu = 2 * Math.atan(Math.sqrt((1 + moon.eccentricity) / (1 - moon.eccentricity)) * Math.tan(E / 2));

    // Calcolo della distanza dalla luna a Duoceli
    const r = moon.distanceFromDuoceli * (1 - moon.eccentricity * Math.cos(E));
    // if (moon.name == "Vulkan") {
    //     console.log("E:", E, "r:", r);
    // }
    // Calcolo delle coordinate cartesiane (nel piano dell'orbita)
    let x = r * Math.cos(nu);
    let y = r * Math.sin(nu);
    // L'asse z è perpendicolare al piano xy e positivo nella direzione del polo nord celeste di Duoceli.
    let z = r * Math.sin(moon.inclination * Math.PI / 180) * Math.sin(nu + moon.argumentOfPerigee * Math.PI / 180);
    // Rotazione per l'argomento del perigeo

    const xPrime = x * Math.cos(moon.argumentOfPerigee) - y * Math.sin(moon.argumentOfPerigee);
    const yPrime = x * Math.sin(moon.argumentOfPerigee) + y * Math.cos(moon.argumentOfPerigee);

    // Rotazione per la longitudine del nodo ascendente
    x = xPrime * Math.cos(moon.longitudeOfAscendingNode) - z * Math.sin(moon.longitudeOfAscendingNode);
    y = yPrime;
    z = xPrime * Math.sin(moon.longitudeOfAscendingNode) + z * Math.cos(moon.longitudeOfAscendingNode);


    // radial velocity
    //v_r = √(μ * (1 - e^2)) * sin(θ)
    const Vr = Math.sqrt(G * (((new SystemInfo()).massDuo+moon.mass) / (r*1000))*(1 + moon.eccentricity) * (1 - moon.eccentricity)) * Math.sin(nu)
    // const Vr = -n * Math.sqrt((1 + moon.eccentricity) * (1 - moon.eccentricity) * moon.distanceFromDuoceli*1000 * Math.sin(nu))


    // tangential velocity
    // v_t = √(μ * (1 - e^2)) * cos(θ)
    const Vt = Math.sqrt(G * (((new SystemInfo()).massDuo+moon.mass) / (r*1000))*(1 + moon.eccentricity) * (1 + moon.eccentricity)) * Math.cos(nu)
    // const Vt = n * Math.sqrt((1 + moon.eccentricity) * (1 + moon.eccentricity) * moon.distanceFromDuoceli*1000 * Math.cos(nu))

    // magnitude of total velocity
    const totalVelocityMagnitude = Math.sqrt(Vr * Vr + Vt * Vt);

    // Direction of total velocity (argument of the total velocity vector)
    const vTheta = Math.atan2(Vt, Vr); // in radians

    const avgVelocity = Math.sqrt(G * (new SystemInfo()).massDuo / (moon.distanceFromDuoceli*1000))

    // Calcolo delle dimensioni apparenti per usi futuri
    // Calcolo dell'angolo solido
    const angularSize = 2 * Math.atan(moon.diameter / (2 * r));

    // Conversione in minuti d'arco
    const angularSizeArcminutes = angularSize * (180 / Math.PI) * 60;


    // Calcolo dell'angolo di posizione rispetto a Duoceli
    const posRad = Math.atan2(y, x);



    return {name, nu, r, x, y, z, theta: posRad, vRadial: Vr, vTangential: Vt, vTotal: totalVelocityMagnitude, vTheta, vAvg: avgVelocity, angularSizeArcminutes}; // Restituisce le informazioni della luna
}
