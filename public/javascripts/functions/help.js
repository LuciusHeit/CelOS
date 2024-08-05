export function help(){
    function generalHelp(){
        term.output(
            "uso: help [comando]" +
            "\n\n- help: Mostra la lista di comandi disponibili o dettagli su come usarli" +
            (isGuest() ? "" :
            "\n- dreambird: Invia messaggi ad altri utenti o visualizza i messaggi ricevuti") +
            "\n- foresight : Avvia una ricerca nel sistema" +
            "\n- spacecalc: Mostra le posizioni dei diversi corpi celesti un determinato giorno" +
            "\n- systemview: Mostra l'orbita di Duoceli in maniera animata" +
            "\n- moonbeam: Mostra le orbite delle lune in maniera animata e prevede eclissi" +
            (isGuest() ?
                "\n- login: Accedi col tuo profilo" :
                "\n- logout: Esci dal tuo profilo" )+
            "\n- clear: Resetta l'interfaccia del terminale CelOS" +
            "\n- shutdown: Spegne il terminale CelOS" +
            "\n\nPuoi vedere informazioni più dettagliate di un programma col comando \"help [comando]\".\n")
    }

    function fnHelp(fn){
        if(fn === "help"){
            generalHelp()
            return
        }
        term.output(TERM_FUNCTIONS.get(fn))
    }


    switch (arguments.length){
        case 0:
            generalHelp()
            break
        case 1:
            fnHelp(arguments[0])
            break;
    }
}