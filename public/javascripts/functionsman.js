import {help} from "./functions/help.js";
import {clear} from "./functions/clear.js";
import {search} from "./functions/search.js";
import {shutdown} from "./functions/shutdown.js";
import {message} from "./functions/message.js";
import {login, logout} from "./functions/login.js";
import {settings} from "./functions/settings.js";
import {spacecalc} from "./functions/spacecalc.js";
import {systemview} from "./functions/systemview.js";
import {moonbeam} from "./functions/moonbeam.js";

export class FunctionsManager {
    term
    functions
    TERM_FUNCTIONS

    constructor(t) {
        this.term = t
        this.functions = new Map()
        this.TERM_FUNCTIONS = new Map()
        this.setup()
    }

    addFn(name, fnName, fn, description, paramN){
        let paramStr = ''
        for(let i = 0; i<paramN; i++){
            if(i>0)
                paramStr = paramStr + ","
            paramStr = paramStr + "PLACEHOLDERPARAM-"+i
        }
        this.functions[name] = ''+fn+"; "+fnName+'('+paramStr+')'
        this.TERM_FUNCTIONS.set(name, description)
    }

    clearFnParams(fn, max=10){
        for(let i = 0; i<max; i++){
            fn = fn.replace("PLACEHOLDERPARAM-"+i+",", "")
            fn = fn.replace("PLACEHOLDERPARAM-"+i, "")
        }
        return fn
    }

    parseFn(name, params){
        let fn = ''+this.functions[name]
        if(!Array.isArray(params) && !(typeof params === "string")){
            fn = this.clearFnParams(fn)
            return fn
        }
        if(typeof params == "string"){
            fn = fn.replace("PLACEHOLDERPARAM-0", "\""+params+"\"")
            fn = this.clearFnParams(fn)
            return fn
        }
        let i = 0
        params.forEach( p => {
            fn = fn.replace("PLACEHOLDERPARAM-"+i, "\""+p+"\"")
            i++

        })
        fn = this.clearFnParams(fn)
        return fn
    }

    setup() {
        this.addFn("help", "help", help,
            ""
            , 1)
        this.addFn("settings", "settings", settings,
            "uso: settings [impostazione] [valore]" +
            "\n\nPermette di cambiare le impostazioni di CelOS." +
            "Usare il comando da solo mostra quali sono le impostazioni disponibili e i valori validi, " +
            "che possono essere invece cambiati con lo stesso comando, ad esempio \"settings saveHistory true\"."
            , 1)
        this.addFn("clear", "clear", clear,
            "uso: clear" +
            "\n\nRipulisce l'interfaccia del terminale CelOS, " +
            "utile soprattutto quando la lista di comandi diventa troppo lunga"
        )
        this.addFn("shutdown", "shutdown", shutdown,
            "uso: shutdown" +
            "\n\nSpegne il terminale CelOS."
        )
        this.addFn("login", "login", login,
            "uso: login [username] [password]" +
            "\n\nAccede a un profilo CelOS." +
            "\nPuò essere usato con username e password nello stesso comando, " +
            "o senza per accedere nascondendo la password a sguardi curiosi."
            , 2)
        this.addFn("logout", "logout", logout,
            "uso: logout" +
            "\n\nEsce dall'attuale profilo CelOS, passando alla modalità Guest.")
        this.addFn("dreambird", "message", message,
            "Placeholder"
        )
        this.addFn("foresight", "search", search,
            "Placeholder"
            , 2)
        this.addFn("spacecalc", "spacecalc", spacecalc,
            "Placeholder"
        )
        this.addFn("systemview", "systemview", systemview,
            "Placeholder"
        )
        this.addFn("moonbeam", "moonbeam", moonbeam,
            "Placeholder"
        )

    }

}