export async function search(){
    let programName = "Foresight"


    async function searchMenu(){
        let SEARCH_COMMANDS = ["help", "search", "exit"]

        term.output("Comandi disponibili: help, search, exit")

        let terminal_msg = await term.input("")
        terminal_msg = terminal_msg.split(" ")
        console.log(terminal_msg)

        if ((SEARCH_COMMANDS.includes(terminal_msg[0]))) {
            switch (terminal_msg.length){
                case 1:
                    try{
                        await eval("SearchClass."+terminal_msg[0] + "()")
                    }
                    catch{
                        await printInvalidCmd()
                    }
                    break
                case 2:
                    await eval(terminal_msg[0] + "(\""+terminal_msg[1]+"\")")
                    break
                case 3:
                    await eval(terminal_msg[0] + "(\""+terminal_msg[1]+"\",\""+terminal_msg[2]+"\")")
                    break
                case 4:
                    await eval(terminal_msg[0] + "(\""+terminal_msg[1]+"\",\""+terminal_msg[2]+"\",\""+terminal_msg[3]+"\")")
                    break
                default:
                    await eval(terminal_msg[0] + "()")
                    break
            }

        } else {
// Handle error if your function is not found
            if (terminal_msg[0].length != 0) {
                term.output(terminal_msg + " is not found")
                term.clear()
                //bootMsg()
                await search()
            }

        }

    }

    async function searchQuery(query, param){

        // available parameters
        // default, -i, --id : searches by id
        // -t, --title : searches by title
        // -c, --category: searches by category
        // -p, --parent : searches by parent id

        let page = null

        switch(param){
            case "-i":
            case "--id":
            case undefined:
                page = await searchRequest(query)
                await printPage(page)
                break
            case "-t":
            case "-title":
                page = await searchRequest("title/"+query)
                await printSelect(page, "Ricerca: (titolo contenente \""+query+"\")\n\n")
                break
            case "-c":
            case "--category":
                page = await searchRequest("category/"+query)
                await printSelect(page, "Ricerca: (categoria contenente \""+query+"\")\n\n")
                break
            case "-p":
            case "--parent":
                page = await searchRequest("parent/"+query)
                await printSelect(page, "Ricerca: (Collegamento con id \""+query+"\")\n\n")
                break

            default:
                printInvalidParam()
        }

        await searchMenu()
    }

    async function printInvalidParam(){
        term.output("Parametri di ricerca non validi.")
        await term.continue()
        term.clear
    }
    async function printInvalidCmd(){
        term.output("Comando non valido.")
        await term.continue()
        term.clear
    }

    async function printPage(page){
        let output = ""
        console.log(page)
        try{
            output ="Titolo: "+page.title+
                "\nCategoria: "+page.category+
                "\n____________________________" +
                "\n\n"+page.content+
                "\n____________________________"
            if(Array.isArray(page.children) && page.children.length > 0)
                output = output.concat("\n\nCollegamenti: \n")
                page.children.forEach( child => {
                        output = output.concat('\n - ', child.title, ' (', child.id, ')')
                    }
                )
        }catch{
            output = "Nessun risultato.\n"
        }


        term.output(output)
    }
    async function printSelect(page, searchTxt){
        let output = searchTxt+"Risultati:" +
            "\n"
        try{
            let i = 1
            page.forEach( p => {
                output += "\n"+i+"- "+p.title+" ("+p.id+")"
                i++
            })
        }catch{
            output = "Nessun risultato.\n"
        }

        term.output(output)

        let selection = ""

        while(selection === ""){
            selection = await term.input("Seleziona quale visualizzare")

            if(parseInt(selection) > page.length || parseInt(selection) <= 0 || isNaN(selection)){
                term.output("Selezione non valida.")
                selection = ""
            }
            else{
                term.clear()
                await printPage(page[parseInt(selection)-1])
            }
        }
    }

    async function searchRequest(query){
        let page = null;
        try {
            term.add_element("loading-text", `Ricerca in corso`, "loading")
            let response = await fetch(BACKEND_URL+"page/"+query)
            await term.delay(1000)
            term.remove_element("loading-text")
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            page = await response.json();
            console.log(page);
        } catch (error) {
            console.error(error.message);
        }
        term.clear()
        return page
    }

    class SearchClass {
        static helpDesc = "Foresight è un programma direttamente collegato al Sistema di Archiviazione Condivisa Arcana," +
            "contenente dati raccolti da contributori e disponibili alla lettura dai nostri sistemi."

        static async help() {
            term.output(this.helpDesc)
            await searchMenu()
        }
        static async exit(){
            term.add_element("loading-text", `Chiusura ${programName}`, "loading") // add HTML element with html text "loading" & class-name "loading" (shows the loading carot via CSS).
            await term.delay(3000) // delay output 5 seconds
            term.remove_element("loading-text") // remove HTML element added earlier
            term.clear()
            bootMsg()
        }
    }


    updateProcess(programName)

    switch (arguments.length){
        case 0:
            term.clear()
            term.add_element("loading-text", `Apertura ${programName}`, "loading") // add HTML element with html text "loading" & class-name "loading" (shows the loading carot via CSS).
            await term.delay(2000) // delay output 5 seconds
            term.remove_element("loading-text") // remove HTML element added earlier
            term.clear()
            await searchMenu()
            break
        case 1:
            term.clear()
            await searchQuery(arguments[0])
            break;
        case 2:
            term.clear()
            await searchQuery(arguments[1], arguments[0])
            break;
    }
}
