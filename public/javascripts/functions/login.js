import {User} from "../lib/user.js";
import {eraseCookie, setCookie} from "../lib/cookieutil.js";

export async function login() {

    let showBoot = true

    async function saveCredentials(id, password){
        setCookie("id", id)
        setCookie("password", password)
    }

    async function fullLogin(){
        let username = await term.input("Inserisci il tuo username")
        toggleSensibleInput()
        let password = await term.password("Inserisci la tua password")
        toggleSensibleInput()

        let user = await loginRequest(username, password, BACKEND_URL, term)

        if (user == null) {
            term.output("Credenziali errate o utente inesistente")
            await term.continue()
        }
        else {
            term.output("Accesso effettuato")
            updateUser(user)

            term.output("\nVorresti salvare le tue credenziali? (Y/N)")

            let choice = await term.mono_input("")
            choice = choice.toUpperCase()
            if(choice === "Y" || choice === "YES" || choice === "S" || choice === "SI" || choice === "YEAH" || choice === "") {
                await saveCredentials(user.id, password)
            }
        }

    }


    term.clear()
    updateProcess("Login")
    term.enable_input()

    switch (arguments.length){
        default:
        case 0:
            await fullLogin()
            break
        case 1:
            await fullLogin()
            showBoot = false
            break
        case 2:
            updateUser(await loginRequest(arguments[0], arguments[1]))
            break;
    }


    term.clear() // exit program
    if (showBoot)
        bootMsg()
}



export async function logout() {
    term.clear()
    term.disable_input()
    updateProcess("Logout")
    term.add_element("loading-text", `Ritorno a utente Guest`, "loading") // add HTML element with html text "loading" & class-name "loading" (shows the loading carot via CSS).
    await term.delay(1000) // delay output 5 seconds
    term.remove_element("loading-text") // remove HTML element added earlier
    term.enable_input()

    updateUser(User.guestUser())
    eraseCookie("id")
    eraseCookie("password")

    term.clear() // exit program
    bootMsg()
}

export async function loginRequest(username, password, address, term){
    let user = null;
    try {
        term.disable_input()
        term.add_element("loading-text", `Accesso in corso`, "loading")
        let response = await fetch(address+"user/login",
            {
                body: JSON.stringify({ username: username, password: password }),
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        await term.delay(700)
        term.remove_element("loading-text")
        term.enable_input()
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        user = await response.json();
    } catch (error) {
        console.error(error.message);
        eraseCookie("id")
        eraseCookie("password")
    }
    return user
}
export async function loginById(id, password, address, term){
    let user = null;
    try {
        term.disable_input()
        term.add_element("loading-text", `Accesso in corso`, "loading")
        let response = await fetch(address+"user/login/id",
            {
                body: JSON.stringify({ username: id, password: password }),
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        await term.delay(400)
        term.remove_element("loading-text")
        term.enable_input()
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        user = await response.json();
    } catch (error) {
        console.error(error.message);
        eraseCookie("id")
        eraseCookie("password")
    }
    return user
}
