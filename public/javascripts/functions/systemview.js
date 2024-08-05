import {
    calculateDaylightHours,
    calculateDaylightHoursForSection,
    calculateOrbitApproximation,
    distanceCalc
} from "../lib/spacelib.js";

export async function systemview(){
    term.clear()

    let programName = "SystemView"
    updateProcess(programName)

    let gg = 0;
    let lat = 0; // 0 = equator, -10 north pol

    const System = new SystemInfo()
    console.log(System)
    const {name, axisDuo, dayLength, yearLength, massDuo, massAur, massGla, distBaryDuo, distBaryAur, distBaryGla, distStars, orbitEccentricity} = System

    // drawing the system
    let c = document.getElementById("screen")
    c.classList.toggle("hidden")
    c.classList.toggle("screen-2")
    let ctx = c.getContext("2d")
    const canvasW = c.getBoundingClientRect().width;
    const canvasH = canvasW / 100 *50
    c.width = c.clientWidth;
    c.height = c.width / 100 * 50;
    let padding = canvasW / 100 * 20
    let dbStarsLine = canvasW - padding*2
    let radiusAu = padding/4
    let radiusGla = padding/9
    let radiusDuo = padding/12
    const extraPaddingGlaucus = padding/3*2
    const biasGlaucus = padding/3*2 + padding/5
    ctx.strokeStyle="#fff"
    ctx.fillStyle = "white";
    ctx.lineWidth = 2;


    let termInput = document.getElementById("termino-input")

    let repeat=true

    function radToDeg(radians) {
        // Store the value of pi.
        var pi = Math.PI;
        // Multiply radians by 180 divided by pi to convert to degrees.
        return radians * (180/pi);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function openingAnim(){
        let animSpeed = 4
        let y = 0
        ctx.font = padding/3+"px Kode Mono";
        let loadingStr = programName,
            loadingWidth = ctx.measureText(loadingStr ).width
        while(y <= canvasH){
            ctx.beginPath()
            ctx.rect(0, 0, canvasW, y)
            ctx.fill()
            ctx.stroke()

            if(y >= canvasH/2-loadingWidth/2){
                ctx.strokeStyle="black"
                ctx.strokeText(loadingStr,(canvasW/2) - (loadingWidth / 2),canvasH/2);
                ctx.strokeStyle="#fff"
                ctx.clearRect(0, y, canvasW, canvasH);
            }

            y+=canvasH/(1000/animSpeed)

            await sleep(5)
        }
        c.classList.toggle("screen-3")
        y=1
        while(y <= canvasH){
            ctx.clearRect(0, 0, canvasW, y);
            y+=canvasH/(800/animSpeed)

            await sleep(5)
        }

    }
    await openingAnim()

    let t = 1

    term.output("Premi invio per uscire.")
    termInput.classList.toggle("hidden")
    document.addEventListener("click", (event) => {
        repeat = false;
    })
    document.addEventListener('keydown', (e) => {
        if (e.code === "Enter")        repeat = false
    });

    while (repeat) {

        let sPos = distanceCalc(t)


        ctx.clearRect(0, 0, canvasW, canvasH);

        // drawing the line between the stars
        ctx.beginPath()
        ctx.moveTo(padding+extraPaddingGlaucus+radiusGla,canvasH/2);
        ctx.lineTo(dbStarsLine + padding - radiusAu, canvasH/2);
        ctx.stroke()

        // drawing Glaucus
        ctx.beginPath()
        ctx.arc(padding+extraPaddingGlaucus, canvasH/2, radiusGla, 0, 2 * Math.PI);
        ctx.fill()
        ctx.stroke()

        // ctx.beginPath()
        // ctx.fillStyle = "blue";
        // ctx.font = radiusGla/3*2+"px Kode Mono";
        // ctx.fillText("Gla", padding+extraPaddingGlaucus-(ctx.measureText("Gla").width/2), canvasH/2+radiusGla/4)
        // ctx.fill()
        // ctx.stroke()

        // drawing Aurum
        ctx.beginPath()
        ctx.strokeStyle="#fff"
        ctx.fillStyle = "white";
        // gradient = ctx.createRadialGradient(dbStarsLine + padding-15, canvasH/2-15, 15, dbStarsLine + padding, canvasH/2, 40);
        // gradient.addColorStop(1, 'blue');
        // gradient.addColorStop(0, '#92BCE6');
        // ctx.fillStyle = gradient;
        ctx.arc(dbStarsLine + padding, canvasH/2, radiusAu, 0, 2 * Math.PI);
        ctx.fill()
        ctx.stroke()

        // ctx.beginPath()
        // ctx.fillStyle = "orange";
        // ctx.font = radiusAu/3*2+"px Kode Mono";
        // ctx.fillText("Aur", dbStarsLine+padding-(ctx.measureText("Aur").width/2), canvasH/2+radiusAu/4)
        // ctx.fill()
        // ctx.stroke()

        ctx.strokeStyle="#fff"
        ctx.fillStyle = "white";

        // drawing the orbit
        // ctx.beginPath()
        // ctx.ellipse(canvasW/2, canvasH/2, dbStarsLine - padding/2-30, 100, 0, 0, 2 * Math.PI)
        // ctx.stroke()


        // calculating Duoceli

        const angleInRadians = sPos.trueAnomaly
        const xDuo = sPos.distFromBarycenter * Math.cos(angleInRadians) * 2.2;
        const yDuo = sPos.distFromBarycenter * Math.sin(angleInRadians);

        // Scale the position to fit the canvas
        const scaleFactor = (dbStarsLine - padding * 2) / System.distStars; // Adjust as needed
        const scaledXDuo = xDuo * scaleFactor + canvasW / 2;
        const scaledYDuo = yDuo * scaleFactor + canvasH / 2;




// Draw Duo's orbit
        ctx.beginPath();
        const numPoints = 100; // Adjust the number of points for desired smoothness
        for (let i = 0; i <= numPoints; i++) {
            const trueAnomaly = i * 360 / numPoints;
            const { x, y } = calculateOrbitApproximation(trueAnomaly, distBaryDuo, orbitEccentricity, scaleFactor, canvasW, canvasH, padding, biasGlaucus);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw Duo's circle
        ctx.beginPath();
        ctx.arc(scaledXDuo + biasGlaucus, scaledYDuo, radiusDuo, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // let totalDaylightHours = calculateDaylightHoursForSection(t, 10, 12)
        // let totalDaylightHours = calculateDaylightHours(42, 12, t)
        let totalDaylightHours = calculateDaylightHours(-100, -100, t)
        // type info
        ctx.font = padding/14+"px Kode Mono";
        ctx.fillText("Ore di luce totali: "+totalDaylightHours,5,canvasH-4-padding/3.5);
        ctx.fillText("Giorno: "+t,5,canvasH-4-padding/7);
        ctx.fillText("Distanza da Aurum: "+Math.round(sPos.distFromAurum / 1e6 *10) /10+ " milioni di km",5,canvasH-4-padding/14);
        ctx.fillText("Distanza da Glaucus: "+Math.round(sPos.distFromGlaucus / 1e6 *10) /10+ " milioni di km",5,canvasH-4);

        t++

        if(t == 433)
            t = 1

        await sleep(25)
    }

    ctx.clearRect(0, 0, canvasW, canvasH);
    termInput.classList.toggle("hidden")
    c.classList.toggle("screen-2")
    c.classList.toggle("screen-3")
    c.classList.toggle("hidden")
    term.clear()
    bootMsg()

}