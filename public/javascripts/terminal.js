import {Terminus} from "./lib/terminus.js";
import {User} from "./lib/user.js";
import {FunctionsManager} from "./functionsman.js";
import {SystemInfo, SystemPos, radToDeg, distanceCalc, Moon, calculateMoonPosition, rotateCoordinates, calculateMoonOrbitApproximation, calculateOrbitApproximation, calculateDaylightHours, calculateDaylightHoursForSection} from "./lib/spacelib.js";
import {loginRequest, loginById} from "./functions/login.js";
import {getCookie, setCookie, eraseCookie} from "./lib/cookieutil.js";
import {Setting, getSetting, DEFAULT_SETTINGS} from "./functions/settings.js";


let scr = document.getElementById("screen")
scr.classList.toggle("hidden")

let osUser = User.guestUser()
let DEFAULT_PROCESS = "Menù Principale"
let UNKILLABLE_PROCESSES = [
    "Shutdown",
    "Logout"
]

let process = "Menù Principale"


const BACKEND_URL = backend+"/api/v1/"


const term= Terminus(document.getElementById("terminal"))

let fnm = new FunctionsManager(term)

let TERM_FUNCTIONS = fnm.TERM_FUNCTIONS

let cookieId = getCookie("id")
let cookiePassword = getCookie("password")

let history = getCookie("history")


if(cookieId != null && cookiePassword != null){
    await loginById(cookieId, cookiePassword, BACKEND_URL, term).then(
        (user) => {
            if(user != null){
                updateUser(user)
            }
        }
    )
}
if(history != null){
    if (getSetting("saveHistory").value === "false")
        eraseCookie("history")
    else
        term.history(history)
}


function bootMsg(){
    term.echo(osUser.password == "" ? "Benvenuto su CelOS!" : "Bentornato su CelOS, "+osUser.username+"!")
    term.echo("Digita \"help\" per vedere la lista di comandi.")
}

function isGuest(){
    return osUser.password === "" || osUser.password == null
}

function toggleSensibleInput(){
    var element = document.getElementById("termino-input");
    element.classList.toggle("censorship");
}

function updateUser(user){
    osUser = user
    let userSpan = document.getElementById("user")
    userSpan.innerText = user.username
    userSpan.classList.toggle("guest", isGuest())
}
function updateProcess(proc){
    if(process === proc)
        return
    let i = 0;
    let speed = 70; /* The speed/duration of the effect in milliseconds */

    process = proc
    let processSpan = document.getElementById("process")
    processSpan.innerHTML = ""

    function typewriter() {
        if (i < process.length) {
            processSpan.innerHTML += process.charAt(i);
            i++;
            setTimeout(typewriter, speed);
        }
    }
    typewriter()
}


async function useFn(terminal_msg){
    switch (terminal_msg.length){
        case 1:
            await eval(fnm.parseFn(terminal_msg[0]))
            break
        case 2:
            await eval(fnm.parseFn(terminal_msg[0], terminal_msg[1]))
            break
        case 3:
            let command = terminal_msg.shift()
            await eval(fnm.parseFn(command, terminal_msg))
            break
        case 4:
            await eval(terminal_msg[0] + "(\""+terminal_msg[1]+"\",\""+terminal_msg[2]+"\",\""+terminal_msg[3]+"\")")
            break
        default:
            await eval(terminal_msg[0] + "()")
            break
    }
}

function saveHistory() {
    setCookie("history", term.history())
}



async function terminal_run() {
    updateProcess(DEFAULT_PROCESS)

    // call the terminal for inital input
    let terminal_msg = await term.input("")
    terminal_msg = terminal_msg.split(" ")

    if(getSetting("saveHistory").value === "true")
        saveHistory()
    console.log(history)

    if ((TERM_FUNCTIONS.has(terminal_msg[0]))) {
        await useFn(terminal_msg)
    } else {
// Handle error if your function is not found
        if (terminal_msg[0].length != 0) {
            term.output(terminal_msg + " is not found")
        }

    }

// after called - repeat function again
    if(process !== "Offline")
        terminal_run();
    else(
        updateUser(new User(-1, "Guest", "", false, false))
    )

}

let cPressed = false
let ctrlPressed = false
async function checkKeyCombination(){
    if(cPressed && ctrlPressed && process !== DEFAULT_PROCESS && !UNKILLABLE_PROCESSES.includes(process))
    {
        let program = process

        updateProcess(DEFAULT_PROCESS)
        term.clear()
        term.output("- "+program+" terminato forzatamente -")
        await terminal_run()
    }
}

document.addEventListener(
    "keyup",
    (event) => {
        const keyName = event.key;
        if(keyName === "Control")
            ctrlPressed = false
        if(keyName === "C" || keyName === "c")
            cPressed = false
    },
    false,
);
document.addEventListener(
    "keydown",
    async (event) => {
        const keyName = event.key;
        if(keyName === "Control")
            ctrlPressed = true
        if(keyName === "C" || keyName === "c")
            cPressed = true
        await checkKeyCombination()
    },
    false,
);

bootMsg()
terminal_run()