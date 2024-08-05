import {eraseCookie, getCookie, setCookie} from "../lib/cookieutil.js";

export class Setting {
    constructor(name, value, possibleValues, description = "") {
        this.name = name
        this.value = value
        this.possibleValues = possibleValues
        this.description = description
    }
}

export const DEFAULT_SETTINGS =  [
    new Setting("saveCredentialsQuestion", "true", ["true", "false"], "Seleziona se vuoi vedere il popup che chiede di salvare le credenziali durante il login. (Non ancora implementato)"),
    new Setting("saveHistory", "true", ["true", "false"], "Seleziona se vuoi salvare la cronologia di comandi per sessioni future."),
    new Setting("animLogo", "true", ["true", "false"], "Seleziona se vuoi vedere il logo di CelOS animato. (Non ancora implementato)"),
]

export async function settings(){
    let settings = []



    function setup(){
        for (let defSetting of DEFAULT_SETTINGS){
            let c = getCookie(defSetting.name)
            c == null ? settings.push(defSetting) : settings.push(new Setting(defSetting.name, c, defSetting.possibleValues, defSetting.description))
        }
    }
    async function reset(){
        if(await term.yes_no("Vuoi resettare le impostazioni ai valori di default? (Y/N)")){
            for (let setting of settings){
                setting.value = setting.possibleValues[0]
                setCookie(setting.name, setting.value)
            }
            term.output("Impostazioni resettate")
        }
        else{
            term.output("Operazione annullata")
        }
    }


    function settingsInfo(){
        term.output("Impostazioni:\n")
        for (let setting of settings){
            console.log(setting)
            term.output(setting.name + ": " + setting.value +
                "\n" + setting.description +
                "\n\nValori possibili: " + (setting.possibleValues.length > 1 ? setting.possibleValues.join(", ") : setting.possibleValues[0])
                +"\n<hr style='width: 100%; border-top: 1px solid;'>")
        }
        term.output("\nPer cambiare un valore, scrivi \"settings [nome] [valore]\" o \"settings [nome]\" per alternare tra i valori possibili." +
            "\nPuoi resettare ai valori di default con \"settings reset\".")
    }

    function toggleSetting(settingName){
        let index = settings.findIndex((setting) => setting.name === settingName)
        if(index > -1){
            let setting = settings[index]
            if (setting.possibleValues.length > 1){
                // cycle to next value
                setting.value = setting.possibleValues[(setting.possibleValues.indexOf(setting.value) + 1) % setting.possibleValues.length]
                term.output("Impostazione " + setting.name + " impostata su " + setting.value)
                settings[index] = setting
                setCookie(setting.name, setting.value)
            }
            else {
                term.output("Il valore dell'impostazione " + setting.name + " deve essere inserito manualmente con \"settings [nome] [valore]\"")
            }
        }
        else {
            term.output("Impostazione \"" + settingName + "\" non trovata")
        }
    }

    setup()
    switch (arguments.length){
        case 0:
            settingsInfo()
            break
        case 1:
            arguments[0] === "reset" ? await reset() : toggleSetting(arguments[0])
            break;
        case 3:
            setSetting(arguments[0], arguments[1], arguments[2])
            break
    }
}

export function getSetting(settingName){
    let c = getCookie(settingName)
    if (c === null){
        return DEFAULT_SETTINGS.find(setting => setting.name === settingName)
    }
    let sett = new Setting(settingName, c, DEFAULT_SETTINGS.find(setting => setting.name === settingName).possibleValues, DEFAULT_SETTINGS.find(setting => setting.name === settingName).description)
    if(!sett.possibleValues.includes(sett.value)){
        eraseCookie(settingName)
        return null
    }
    return sett
}
