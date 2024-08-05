export async function message(){
    let programName = "Dreambird"
    let user = osUser
    let messagesList = []


    term.clear()
    updateProcess(programName)


    if(user.id <= -1){
        term.output("Esegui l'accesso per continuare." +
            "\nVuoi effettuare l'accesso? (Y/N)")

        let choice = await term.mono_input("")
        choice = choice.toUpperCase()
        if(choice === "Y" || choice === "YES" || choice === "S" || choice === "SI" || choice === "YEAH" || choice === "") {
            term.disable_input()
            await term.delay(100) // delay output 5 seconds
            await useFn(["login", "message"])
            user = osUser
            if (user.id <= -1) {
                term.clear()
                bootMsg()
                return
            }
        }
        else{
            await term.continue()
            term.clear()
            bootMsg()
            return
        }
    }

    async function getReceivedMessages(){
        let req = await fetch(BACKEND_URL+"msg/received",
            {
                body: JSON.stringify({ id: user.id, password: user.password }),
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        if (!req.ok) {
            throw new Error(`Response status: ${req.status}`);
        }
        let messages = await req.json()
        let messagesByDate = messages.sort((a, b) => new Date(b.date) - new Date(a.date))
        let messagesBySender = new Map()
        messagesByDate.forEach(message => {
            if(!messagesBySender.has(message.sender)){
                messagesBySender.set(message.sender, [message])
            }
            else{
                messagesBySender.get(message.sender).push(message)
            }
        })
        return messagesBySender
    }
    async function getUnreadNumber(){
        let req = await fetch(BACKEND_URL+"msg/unread/"+osUser.id)
        if (!req.ok) {
            throw new Error(`Response status: ${req.status}`);
        }
        return await req.json()
    }

    async function printMessagesReceivedBySender(messages, sender){

        let readIds = []

        term.clear()
        term.output("Messaggi da: " + sender)
        let i = 0
        messages.forEach(message => {
            i++
            term.output(i + ". " + message.content)
            readIds.push(message.id)
        })

        if(i === 0){
            term.output("Nessun messaggio ricevuto")
        }

        let req = await fetch(BACKEND_URL+"msg/seen",
            {
                body: JSON.stringify({ userId: user.id, password: user.password, ids: readIds }),
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        if (!req.ok) {
            throw new Error(`Response status: ${req.status}`);
        }


        let choice = await term.yes_no("Vuoi rispondere a questo utente? (Y/N)")

        term.output(choice)

        await term.continue()
    }
    async function printMessagesReceived(messagesBySender){
        console.log(messagesBySender)
        let i = 0
        messagesBySender.forEach((value, key) => {
            i++
            let unread = value.filter(msg => !msg.read).length
            if(unread > 0)
                term.output(i + ". " + key + " <span style='color: #d48d13'>(" + unread + " non letti) </span>")
            else
                term.output(i + ". " + key)
        })

        if(i === 0){
            term.output("Nessun messaggio ricevuto")
        }

        term.output("\n0. Torna indietro" +
            "\n\nSeleziona il messaggio da visualizzare.")

        let choice = await term.mono_input("")
        if(choice === "0"){
            term.clear()
            return
        }
        let senderIterator = messagesBySender.keys()
        let senderChosen = ""
        for (let i = 0; i <= parseInt(choice)-1; i++) {
            if(i == choice-1){
                console.log(choice)
                console.log("TEST")
                senderChosen = senderIterator.next().value
            }
            else
                senderIterator.next()
        }
        if(senderChosen === ""){
            term.output("Errore durante il recupero dei messaggi" +
                "\nRiprova più tardi")
            await term.continue()
            return
        }
        await printMessagesReceivedBySender(messagesBySender.get(senderChosen), senderChosen)
    }
    async function sendMsg(receiver, content){
        console.log(user)
        let req = await fetch(BACKEND_URL+"msg/send",
            {
                body: JSON.stringify({ senderId: user.id, password: user.password, receiver: receiver, content: content }),
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        if (!req.ok || req.status !== 200 || await req.json() == false) {
            term.output("\nErrore durante l'invio del messaggio" +
                "\nRiprova più tardi")
            await term.continue()
            return
        }

        term.output("\nMessaggio inviato con successo!")

        await term.continue()
    }

    term.disable_input()
    term.add_element("loading-text", `Apertura ${programName}`, "loading") // add HTML element with html text "loading" & class-name "loading" (shows the loading carot via CSS).
    let unreadNumber = await getUnreadNumber()
    await term.delay(1000) // delay output
    term.enable_input()
    if(unreadNumber < 0){
        term.output("Errore durante il recupero dei messaggi" +
            "\nRiprova più tardi")
        await term.continue()
    }
    term.remove_element("loading-text") // remove HTML element added earlier
    term.clear()
    term.output(`Ciao ${user.username}`)
    term.output("1. Visualizza i messaggi" + (unreadNumber > 0 ? ` <span style='color: #d48d13'>(${unreadNumber} nuovi messaggi)</span>` : "") +
        "\n2. Invia un messaggio" +
        "\n3. Esci")

    let termvalue = await term.mono_input("Digita la tua selezione.")

    switch (termvalue) {
        case "1":
            term.clear()
            let messages = await getReceivedMessages()
            await printMessagesReceived(messages)
            break
        case "2":
            term.clear()
            term.output("Inserisci il destinatario:")
            let receiver = await term.input("")
            term.output("Inserisci il messaggio:")
            let content = await term.input("")
            await sendMsg(receiver, content)
            break
        case "3":
            term.add_element("loading-text", `Chiusura ${programName}`, "loading") // add HTML element with html text "loading" & class-name "loading" (shows the loading carot via CSS).
            await term.delay(1300)
            term.remove_element("loading-text") // remove HTML element added earlier
            term.clear() // exit program
            bootMsg()
            break
        default:
            term.output("Scelta non valida")
            break
    }


// after called - repeat function again (if not exit menu)
    if (termvalue != "3") {
        term.clear()
        await message()
    }
}