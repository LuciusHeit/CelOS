import {radToDeg, distanceCalc} from "../lib/spacelib.js";
import {SystemInfo} from "../lib/spacelib.js"

export async function spacecalc(){


    term.clear()

    let programName = "SpaceCalc"
    updateProcess(programName)

    let gg = 0;
    let lat = 0; // 0 = equator, -10 north pole, 10 south pole

    const System = new SystemInfo()
    console.log(System)
    const {name, axisDuo, dayLength, yearLength, massDuo, massAur, massGla, distBaryDuo, distBaryAur, distBaryGla, distStars, orbitEccentricity} = System

    let repeat= true


    while (repeat) {

        // momento nell'orbita da calcolare
        // t = 1
        term.output("Inserire il giorno da calcolare (da 1 a " + yearLength + ")")

        let choice = await term.input("")
        const t = parseInt(choice);

        let sPos = distanceCalc(t);
        let rDuo = sPos.distFromBarycenter
        let rAur = sPos.distFromAurum
        let rGla = sPos.distFromGlaucus
        let E = sPos.eccentricAnomaly
        let nu = sPos.trueAnomaly

        let lythosPos = sPos.moonByName("Lythos")
        let vulkanPos = sPos.moonByName("Vulkan")
        let prismaPos = sPos.moonByName("Prisma")
        let nyxPos = sPos.moonByName("Nyx")


        // Print the results
        term.output("Distanza media di Duoceli dal baricentro orbitale: "+ Math.round(distBaryDuo / 1e6 *100) /100+ " milioni di km");
        term.output("Distanza di Aurum dal baricentro orbitale: "+ Math.round( distBaryAur / 1e6 *100) /100+ " milioni di km");
        term.output("Distanza di Glaucus dal baricentro orbitale: "+ Math.round(distBaryGla / 1e6 *100) /100+ " milioni di km");
        term.output("Anomalia eccentrica: "+ Math.round(radToDeg(E) *100) /100+ " gradi");
        term.output("Vera anomalia: "+ Math.round(radToDeg(nu) *100) /100+ " gradi");
        term.output("Distanza attuale dal baricentro orbitale: "+ Math.round(rDuo / 1e6 *100) /100+ " milioni di km");
        term.output("Distanza attuale da Aurum: "+ Math.round(rAur / 1e6 *100) /100+ " milioni di km");
        term.output("Distanza attuale da Glaucus: "+ Math.round(rGla / 1e6 *100) /100+ " milioni di km");
        term.output("Valori di Lythos: r="+ Math.round(lythosPos.r *100) /100 + ", nu="+ Math.round(radToDeg(lythosPos.nu) *100) /100 + "deg, x="+ lythosPos.x + ", y="+ lythosPos.y + ", z="+ lythosPos.z);
        term.output("Valori di Vulkan: r="+ Math.round(vulkanPos.r *100) /100 + ", nu="+ Math.round(radToDeg(vulkanPos.nu) *100) /100 + "deg, x="+ vulkanPos.x + ", y="+ vulkanPos.y + ", z="+ vulkanPos.z);
        term.output("Valori di Prisma: r="+ Math.round(prismaPos.r *100) /100 + ", nu="+ Math.round(radToDeg(prismaPos.nu) *100) /100 + "deg, x="+ prismaPos.x + ", y="+ prismaPos.y + ", z="+ prismaPos.z);
        term.output("Valori di Nyx: r="+ nyxPos.r + ", nu="+ Math.round(radToDeg(nyxPos.nu) *100) /100 + "deg, x="+ nyxPos.x + ", y="+ nyxPos.y + ", z="+ nyxPos.z);

        term.output("Continuare? (Y/n)")

        choice = await term.input("")
        // choice to lowercase
        if(choice !== undefined)
            choice = choice.toLowerCase()
        repeat = choice === "y" || choice === "yes" || choice === undefined;
    }

    term.clear()
    bootMsg()

}