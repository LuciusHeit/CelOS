
export async function shutdown(){
    updateProcess("Shutdown")
    term.output("Arrivederci!")
    term.add_element("loading-text", `\nSpegnimento in corso`, "loading") // add HTML element with html text "loading" & class-name "loading" (shows the loading carot via CSS).
    await term.delay(3000) // delay output 5 seconds
    term.remove_element("loading-text") // remove HTML element added earlier
    term.kill()
    updateProcess("Offline")
}