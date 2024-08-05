import {calculateMoonPosition, distanceCalc, calculateMoonOrbitApproximation} from "../lib/spacelib.js";

export async function moonbeam(){
    term.clear()

    let programName = "MoonBeam"
    updateProcess(programName)

    let gg = 1;
    let lat = 0; // 0 = equator, -10 north pol
    let animSpeed = 1/4
    let year = 0

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
    let radiusDuo = canvasH/3
    let textInfo = "none"
    ctx.strokeStyle="#fff"
    ctx.fillStyle = "white";
    ctx.lineWidth = 2;


    let termInput = document.getElementById("termino-input")

    let showOrbits = true
    let shownMoons = System.moons.map( m => m.name.toLowerCase() )
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

    async function openingAnim(clearText){
        let animSpeed = 7
        let y = 0
        ctx.font = padding/3+"px Kode Mono";
        ctx.textAlign = "left";
        termInput.classList.toggle("hidden")

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
                if(clearText)
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

        termInput.classList.toggle("hidden")
        termInput.focus()
    }
    await openingAnim(true)

    let t = 1

    term.output("Digita \"help\" per la lista dei comandi")



    term.input("").then((cmd) => {
        manageCommands(cmd)
    })

    function manageCommands(cmd, isRecursion = false) {
        term.clear()
        let cmdArr = cmd.split(" ")
        cmdArr = cmdArr.filter( e => e !== "" )
        let mainCmd = cmdArr[0]
        switch (mainCmd) {
            case "exit":
                repeat = false
                break
            case "help":
                term.output("- help: mostra la lista dei comandi" +
                    "\n- speed: cambia la velocità dell'animazione" +
                    "\n- date [anno] [giorno]: cambia la data" +
                    "\n- moon [nome]: mostra o nasconde una luna" +
                    "\n- info [categoria]: mostra le informazioni sul sistema" +
                    "\n- clear: cancella la schermata del terminale" +
                    "\n- exit: esce dal programma")
                break
            case "clear":
                term.clear()
                break
            case "orbit":
            case "orbits":
                showOrbits = !showOrbits
                break
            case "moon":
            case "moons":
                if (cmdArr.length > 1) {
                    if (cmdArr[1] === "info") {
                        if (cmdArr.length > 2){
                            manageCommands("info moon "+cmdArr[2], true)
                            break
                        }
                        manageCommands("info moon", true)
                        break
                    }
                    if (cmdArr[1] === "all" || cmdArr[1] === "toggle" || cmdArr[1] === "show" || cmdArr[1] === "hide" || cmdArr[1] === "showall" || cmdArr[1] === "hideall" || cmdArr[1] === "toggleall" || cmdArr[1] === "tutte" || cmdArr[1] === "mostra" || cmdArr[1] === "nascondi") {
                        if (shownMoons.length > 0) {
                            shownMoons = []
                            term.output("Tutte le stelle sono state nascoste")
                            break
                        }
                        shownMoons = System.moons.map( m => m.name.toLowerCase() )
                        term.output("Tutte le stelle sono visibili")
                        break
                    }
                    if (shownMoons.includes(cmdArr[1].toLowerCase())) {
                        shownMoons.splice(shownMoons.indexOf(cmdArr[1].toLowerCase()), 1)
                        term.output("Stella nascosta: "+shownMoons.indexOf(cmdArr[1]))
                        break
                    }
                    shownMoons.push(System.moonByName(cmdArr[1]).name.toLowerCase() )
                    term.output("Stella aggiunta: "+shownMoons.indexOf(cmdArr[1]))
                    break
                }
                term.output("Uso: moon [nome]")
                term.output("Digita \"help\" per la lista dei comandi")
                break
            case "date":
                if (cmdArr.length > 1) {
                    if(cmdArr.length > 2){
                        year = cmdArr[1]
                        gg = parseInt(cmdArr[2])
                        t = (year * yearLength) + gg
                        term.output("Data impostata al giorno: "+gg+" - anno: "+year)
                        break
                    }
                    year = parseInt(cmdArr[1])
                    gg = 1
                    t = year * yearLength + gg

                    term.output("Data impostata al giorno: "+gg+" - anno: "+year)
                    break
                }
                term.output("Uso: date [anno] [giorno]")
                term.output("Digita \"help\" per la lista dei comandi")
                break
            case "speed":
                if (cmdArr.length > 1) {
                    console.log(cmdArr[1].split("/"))
                    if (cmdArr[1].split("/").length > 1) {
                        console.log(cmdArr[1].split("/"))
                        let num = cmdArr[1].split("/")
                        animSpeed = parseFloat(num[0]) / parseFloat(num[1])
                        break
                    }
                    animSpeed = parseFloat(cmdArr[1])
                }
                else {
                    term.output("Digita \"help\" per la lista dei comandi")
                }
                break
            case "info":
                if (cmdArr.length > 1) {
                    switch (cmdArr[1]) {
                        case "name":
                        case "names":
                        case "nome":
                        case "nomi":
                        case "n":
                            textInfo = "names"
                            break
                        case "duo":
                        case "duoceli":
                        case "d":
                            textInfo = "duo"
                            break
                        case "moons":
                        case "lune":
                        case "moon":
                        case "luna":
                        case "l":
                        case "m":
                            if (cmdArr.length > 2) {
                                let moon = System.moonByName(cmdArr[2])
                                if (moon) {
                                    term.output("Nome: " + moon.name)
                                    textInfo = "moon " + moon.name
                                }
                                else {
                                    term.output("Luna non trovata")
                                }
                                break
                            }
                            textInfo = "moons"
                            break
                        case "orbit":
                        case "orbita":
                        case "o":
                            textInfo = "orbit"
                            break
                        case "help":
                        case "aiuto":
                        case "h":
                            term.output("Possibili info: names, orbits, moons, moon [nome], duo")
                            term.output("Uso: info [categoria]")
                            break

                        default:
                            term.output("Comando non riconosciuto")
                            term.output("Possibili info: names, orbits, moons, moon [nome], duo")
                            term.output("Uso: info [categoria]")
                            break
                    }
                    console.log(textInfo)
                }
                else {
                    term.output("Uso: info [categoria]")
                    term.output("Possibili info: names, orbits, moons, moon [nome], duo")
                    term.output("Digita \"help\" per la lista dei comandi")
                }
                break
            default:
                term.output("Comando non riconosciuto")
                term.output("Digita \"help\" per la lista dei comandi")
                break

        }

        if (repeat && !isRecursion){
            term.input("").then((cmd) => {
                manageCommands(cmd)
            })
        }
    }


    while (repeat) {

        // calculating the scale factor
        const scaleFactorOrbit = 1/10000;
        const scaleFactorRadius = 1/320;

        ctx.clearRect(0, 0, canvasW, canvasH);

        // draw static Duoceli
        ctx.beginPath();
        ctx.arc(canvasW/2, canvasH/2, System.radiusDuo*scaleFactorRadius/2, 0, 2 * Math.PI);
        ctx.stroke();

        let moonList = []

        System.moons.forEach( m => {
            moonList.push(calculateMoonPosition(m, t))
        })


        // function drawOrbit(nPoints, moon) {
        //     ctx.beginPath();
        //     for (let i = 0; i <= nPoints; i++) {
        //         const trueAnomaly = i * 360 / nPoints;
        //         const { x, y } = calculateMoonOrbitApproximation(trueAnomaly, moon, scaleFactorOrbit, canvasW, canvasH, padding);
        //         if (i === 0) {
        //             ctx.moveTo(x, y);
        //         } else {
        //             ctx.lineTo(x, y);
        //         }
        //     }
        //     ctx.stroke();
        // }
        function drawMoonListOrbits(moonList){
            moonList.forEach(moon => {
                drawOrbit(360, moon)
            })
        }
        function drawOrbit(nPoints, moon) {
            const points = [];
            const speed = 0.1;
            let currentArcLength = 0;
            const desiredArcLengthStep = 2 * Math.PI * System.moonByName(moon.name).distanceFromDuoceli*scaleFactorOrbit / nPoints;

            let prevX = 0;
            let prevY = 0;
            let trueAnomaly = 0;
            const maxIterations = 10000; // Limite massimo di iterazioni
            let iterationCount = 0;

            while (points.length < nPoints && iterationCount < maxIterations) {
                // const { x, y } = calculateMoonOrbitApproximation(trueAnomaly, moon, scaleFactorOrbit, canvasW, canvasH, padding);
                let {name, nu, r, x, y, z} = calculateMoonPosition(System.moonByName(moon.name), trueAnomaly);
                x = x*scaleFactorOrbit+canvasW/2
                y = y*scaleFactorOrbit+canvasH/2
                // Calcola la lunghezza dell'arco tra i punti consecutivi
                const dx = x - prevX;
                const dy = y - prevY;
                currentArcLength += Math.sqrt(dx * dx + dy * dy);

                if (currentArcLength >= desiredArcLengthStep) {
                    points.push({ x, y });
                    currentArcLength = 0;
                }
                iterationCount++;

                prevX = x;
                prevY = y;
                trueAnomaly += speed; // Incremento piccolo per il calcolo numerico
            }

            if (iterationCount >= maxIterations) {
                console.error("Il ciclo ha raggiunto il numero massimo di iterazioni senza convergere.");
                // Gestisci l'errore (ad esempio, interrompi l'esecuzione o visualizza un messaggio)
            }
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.strokeStyle = "#777";
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
            ctx.strokeStyle = "#fff";

        }

        function drawMoonList(moons){
            // sort the moons by Z axis
            let mList = JSON.parse(JSON.stringify(moons))

            mList.sort((a, b) => a.z - b.z);

            // draw the moons
            for (let i = 0; i < mList.length; i++) {
                drawMoon(mList[i])
            }
        }
        function drawMoon(moon){
            ctx.beginPath();
            let moonInfo = System.moonByName(moon.name)
            ctx.fillStyle = moonInfo.color
            ctx.lineWidth = 1
            ctx.strokeStyle = "#fff";
            moon.x = moon.x*scaleFactorOrbit+canvasW/2
            moon.y = moon.y*scaleFactorOrbit+canvasH/2
            ctx.arc(moon.x, moon.y, moonInfo.diameter*scaleFactorRadius/2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "#fff"
            ctx.stroke();
            ctx.lineWidth = 2
        }
        if (showOrbits){
            drawMoonListOrbits(moonList.filter( m => shownMoons.includes(m.name.toLowerCase())));
        }
        drawMoonList(moonList.filter( m => shownMoons.includes(m.name.toLowerCase())));


        ctx.font = padding/14+"px Kode Mono";
        ctx.fillStyle = "#fff"
        ctx.textAlign = "left";
        ctx.fillText("Anno: "+year,5,canvasH-5-padding/3.5);
        ctx.fillText("Giorno: "+Math.floor(gg),5,canvasH-5-padding/7);
        ctx.fillText("Ora: "+Math.floor((t%1)*System.dayLength)+ ":"+Math.floor(((t%1)*System.dayLength)%1*60),5,canvasH-5-padding/14);

        ctx.textAlign = "right";


        // diverse funzioni di info testuali
        function textInfoOrbit(){
            let i=1
            moonList.forEach( m => {
                ctx.fillText("Distanza tra "+m.name+" e Duoceli: "+Math.round(m.r)+"km",canvasW-5,canvasH-5-padding/14*i);
                i++
            })
            let moonsByZAxisString = JSON.parse(JSON.stringify(moonList))
            moonsByZAxisString = moonsByZAxisString.sort((a, b) => a.z - b.z).map(moon => moon.name).join(", ");
            ctx.fillText("Ordine lune per asse Z: "+moonsByZAxisString,canvasW-5,canvasH-5-padding/14*5);
        }
        function textInfoDuoceli(){
            ctx.fillText("Informazioni su Duoceli", canvasW-5, canvasH-5-padding/14*10);
            ctx.fillText("Asse: "+System.axisDuo+"°", canvasW-5, canvasH-5-padding/14*9);
            ctx.fillText("Distanza media col centro del sistema: "+System.distBaryDuo+"km", canvasW-5, canvasH-5-padding/14*8);
            ctx.fillText("Distanza media con Glaucus: "+System.distBaryGla+"km", canvasW-5, canvasH-5-padding/14*7);
            ctx.fillText("Distanza media con Aurora: "+System.distBaryAur+"km", canvasW-5, canvasH-5-padding/14*6);
            ctx.fillText("Massa: "+System.massDuo+"kg", canvasW-5, canvasH-5-padding/14*5);
            ctx.fillText("Eccentricità dell'orbita: "+System.orbitEccentricity, canvasW-5, canvasH-5-padding/14*4);
            ctx.fillText("Raggio: "+System.radiusDuo+"km", canvasW-5, canvasH-5-padding/14*3);
            ctx.fillText("Ore in un giorno: "+System.dayLength, canvasW-5, canvasH-5-padding/14*2);
            ctx.fillText("Giorni in un anno: "+System.yearLength, canvasW-5, canvasH-5-padding/14*1);
        }
        function textInfoNames(){
            let i=1
            moonList.forEach( m => {
                ctx.fillStyle = "#fff"
                ctx.strokeText(m.name,canvasW-5,canvasH-5-padding/14*i)
                ctx.fillText("Luna "+i+": "+m.name,canvasW-5,canvasH-5-padding/14*i)
                ctx.fillStyle = System.moonByName(m.name).color
                ctx.fillText(m.name,canvasW-5,canvasH-5-padding/14*i);
                i++
            })

            i++
            ctx.fillStyle = "#fff";
            // nome del pianeta
            ctx.fillText("Pianeta: Duoceli",canvasW-5,canvasH-5-padding/14*i);
            i++
            // nome delle stelle
            ctx.fillText("Stelle: Aurum e Glaucus",canvasW-5,canvasH-5-padding/14*i);
            i++
            // nome del sistema
            ctx.fillText("Sistema: "+System.name,canvasW-5,canvasH-5-padding/14*i);
        }
        function textInfoMoon(moon){

            let moonInfo = System.moonByName(moon.name)

            ctx.fillStyle = System.moonByName(moon.name).color
            ctx.lineWidth = 1
            ctx.fillText(moon.name,canvasW-5,canvasH-5-padding/14*8)
            ctx.strokeText(moon.name,canvasW-5,canvasH-5-padding/14*8)
            ctx.lineWidth = 2
            ctx.fillStyle = "#fff"

            // distanza
            ctx.fillText("Distanza da Duoceli: "+Math.round(moon.r)+"km, Angolo 2D rispetto a Duoceli: "+(Math.round(radToDeg(moon.theta)*100)/100).toFixed(2)+"°",canvasW-5,canvasH-5-padding/14*7);
            // velocità
            ctx.fillText("Velocità attuale: "+(Math.round(moon.vTotal*100)/100).toFixed(2)+"m/s, V media: "+Math.round(moon.vAvg*100)/100+"m/s",canvasW-5,canvasH-5-padding/14*6);
            ctx.fillText("V radiale: "+(Math.round(moon.vRadial*100)/100).toFixed(2)+"m/s, V tangenziale: "+(Math.round(moon.vTangential*100)/100).toFixed(2)+"m/s",canvasW-5,canvasH-5-padding/14*5);
            ctx.fillText("Direzione movimento: "+(Math.round(radToDeg(moon.vTheta)*100)/100).toFixed(2)+"°",canvasW-5,canvasH-5-padding/14*4);
            // massa
            ctx.fillText("Massa: "+moonInfo.mass+"kg",canvasW-5,canvasH-5-padding/14*3);
            // ecc
            ctx.fillText("Eccentricità: "+moonInfo.eccentricity,canvasW-5,canvasH-5-padding/14*2);
            // dimensione angolare apparente
            ctx.fillText("Dimensione angolare apparente: "+Math.round(moon.angularSizeArcminutes)+"‘",canvasW-5,canvasH-5-padding/14);

        }
        function textInfoMoons(){
            let i=1
            let totRows = moonList.length * 2
            moonList.forEach( m => {
                let moonInfo = System.moonByName(m.name)
                ctx.fillText("Luna "+Math.ceil(i/2)+": "+m.name+" (Massa: "+moonInfo.mass+"kg, Diametro: "+moonInfo.diameter+", Periodo orbitale: "+moonInfo.orbitalPeriod+"gg)",canvasW-5,canvasH-5-padding/14*(totRows-i))
                i++
                ctx.fillText("\""+moonInfo.features+"\"",canvasW-5,canvasH-5-padding/14*(totRows-i))
                i++
            })
        }

        switch (textInfo.split(" ")[0]){
            case "orbit":
                textInfoOrbit()
                break
            case "duo":
                textInfoDuoceli()
                break
            case "names":
                textInfoNames()
                break
            case "moon":
                textInfoMoon(moonList.find( m => m.name.toLowerCase() == textInfo.split(" ")[1].toLowerCase()))
                break
            case "moons":
                textInfoMoons()
                break
            case "none":
                break
        }




        t+=1/System.dayLength*animSpeed

        function updateCalendar(){
            gg = Math.floor(t)%System.yearLength
            year = Math.floor(t/System.yearLength)
        }

        updateCalendar()


        await sleep(25)
    }

    term.clear()
    await openingAnim(false)
    ctx.clearRect(0, 0, canvasW, canvasH);
    c.classList.toggle("screen-2")
    c.classList.toggle("screen-3")
    c.classList.toggle("hidden")
    term.clear()
    bootMsg()

}