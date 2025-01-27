export function Terminus(terminalSelector, keyCodes, settings) {
    try {
        if (!terminalSelector)
            throw {
                message: "No Query Selector was provided."
            };
        let DEF_SETTINGS = {
            allow_scroll: !0,
            prompt: "> ",
            command_key: 13,
            terminal_killed_placeholder: "TERMINAL DISABLED",
            terminal_output: ".termino-console",
            terminal_input: ".termino-input",
            disable_terminal_input: !1
        };
        let cmdHistory = []
        let cmdHistoryIndex = -1
        if (settings) {
            function compare(e, t) {
                let r = Object.keys(e)
                    , n = Object.keys(t);
                if (r.length != n.length)
                    return !1;
                for (var i = 0; i < r.length; i++)
                    if (r[i] != n[i])
                        return !1;
                return !0
            }
            if (!0 != compare(DEF_SETTINGS, settings))
                throw {
                    message: "Settings Error: Your overwritten Termino settings are not valid"
                };
            DEF_SETTINGS = settings
        }
        let terminal_console = terminalSelector.querySelector(DEF_SETTINGS.terminal_output)
            , terminal_input = terminalSelector.querySelector(DEF_SETTINGS.terminal_input)
            , KEYCODES = [{
            id: "SCROLL_UP_KEY",
            key_code: 38
        }, {
            id: "SCROLL_DOWN_KEY",
            key_code: 40
        }]
            , Scroll_Up_Key = KEYCODES[0].key_code
            , Scroll_Down_Key = KEYCODES[1].key_code;
        keyCodes && (0 != keyCodes.filter(e=>"SCROLL_UP_KEY" === e.id).length && void 0 != keyCodes.filter(e=>"SCROLL_UP_KEY" === e.id)[0].key_code && (Scroll_Up_Key = keyCodes.filter(e=>"SCROLL_UP_KEY" === e.id)[0].key_code),
        0 != keyCodes.filter(e=>"SCROLL_DOWN_KEY" === e.id).length && void 0 != keyCodes.filter(e=>"SCROLL_DOWN_KEY" === e.id)[0].key_code && (Scroll_Down_Key = keyCodes.filter(e=>"SCROLL_DOWN_KEY" === e.id)[0].key_code),
            KEYCODES = keyCodes);
        let Command_Key = DEF_SETTINGS.command_key;
        terminalSelector.addEventListener("keydown", e=>{
                !0 != DEF_SETTINGS.disable_terminal_input && checkIfCommand()
                !0 === DEF_SETTINGS.allow_scroll && (e.keyCode == Scroll_Up_Key ? terminal_console.scrollTo({
                    top: 0,
                    behavior: "smooth"
                }) : e.keyCode == Scroll_Down_Key && (terminal_console.scrollTop = terminal_console.scrollHeight))
                e.keyCode == Scroll_Up_Key && cmdHistoryIndex < cmdHistory.length-1 ? termIterHistory(true) : e.keyCode == Scroll_Down_Key && cmdHistoryIndex >= 0 && termIterHistory(false)
            }
        );

        let InputState = !1;

        function termIterHistory(e) {
            if(e){
                cmdHistoryIndex++
                terminal_input.value = cmdHistory[cmdHistoryIndex]
            }
            else{
                cmdHistoryIndex--
                cmdHistoryIndex < 0 ?
                    terminal_input.value = "" :
                    terminal_input.value = cmdHistory[cmdHistoryIndex]
            }

        }
        function termHistory(e){
            if(e != null){
                cmdHistory = e.split(",")
            }
            return cmdHistory
        }
        function termInput(e) {
            return new Promise(function(t) {
                    function r(e) {
                        if (e.keyCode == Command_Key) {
                            window.event.preventDefault && window.event.preventDefault();
                            let n = terminalSelector.querySelector(DEF_SETTINGS.terminal_input).value;
                            0 != n.length ? cmdHistory.unshift(n) : 0
                            cmdHistory.length > 10 && cmdHistory.pop();
                            cmdHistoryIndex = -1
                            termClearValue(),
                                terminalSelector.querySelector(DEF_SETTINGS.terminal_input).removeEventListener("keypress", r),
                                InputState = !1,
                                0 != n.length ? (termEcho(n),
                                    t(n)) : (termEcho(""),
                                    t())
                        }
                    }
                    terminal_console.innerHTML += e,
                        termClearValue(),
                        scrollTerminalToBottom(),
                        InputState = !0,
                        terminalSelector.querySelector(DEF_SETTINGS.terminal_input).addEventListener("keypress", r)
                }
            )
        }
        function termMonoInput(e) {
            return new Promise(function(t) {
                    function r(e) {
                        window.event.preventDefault && window.event.preventDefault();
                        let n = e.key
                        termClearValue(),
                            terminalSelector.querySelector(DEF_SETTINGS.terminal_input).removeEventListener("keypress", r),
                            InputState = !1,
                            0 != n.length ? (termEcho(n),
                                t(n)) : (termEcho(""),
                                t())
                    }
                    terminal_console.innerHTML += e,
                        termClearValue(),
                        scrollTerminalToBottom(),
                        InputState = !0,
                        terminalSelector.querySelector(DEF_SETTINGS.terminal_input).addEventListener("keypress", r)
                }
            )
        }
        async function termYesNo(e) {
            if(e == null)
                e = "(Y/N)";
            let choice = await termMonoInput(e)
            choice = choice.toUpperCase()
            if(choice === "Y" || choice === "YES" || choice === "S" || choice === "SI" || choice === "YEAH" || choice === "") {
                return true
            }
            return false
        }
        async function termContinue(e) {
            if(e == null)
                e = "\nPremi un tasto per continuare...";
            this.output(e)
            return await termMonoInput("")
        }
        function termPassword(e) {
            return new Promise(function(t) {
                    function r(e) {
                        if (e.keyCode == Command_Key) {
                            window.event.preventDefault && window.event.preventDefault();
                            let n = terminalSelector.querySelector(DEF_SETTINGS.terminal_input).value;
                            termClearValue(),
                                terminalSelector.querySelector(DEF_SETTINGS.terminal_input).removeEventListener("keypress", r),
                                InputState = !1,
                                0 != n.length ? (termEcho(n.replace(/./g, '*')),
                                    t(n)) : (termEcho(""),
                                    t())
                        }
                    }
                    terminal_console.innerHTML += e,
                        termClearValue(),
                        scrollTerminalToBottom(),
                        InputState = !0,
                        terminalSelector.querySelector(DEF_SETTINGS.terminal_input).addEventListener("keypress", r)
                }
            )
        }
        function termEcho(e) {
            terminal_console.innerHTML += `<pre>${DEF_SETTINGS.prompt}${e}</pre>`,
                scrollTerminalToBottom()
        }
        function termOutput(e) {
            terminal_console.innerHTML += `<pre>${e}</pre>`,
                scrollTerminalToBottom()
        }
        function termClear() {
            terminal_console.innerHTML = ""
        }
        function termKill() {
            termClear(),
                terminalSelector.querySelector(DEF_SETTINGS.terminal_input).setAttribute("disabled", ""),
                terminalSelector.querySelector(DEF_SETTINGS.terminal_input).setAttribute("placeholder", DEF_SETTINGS.terminal_killed_placeholder)
        }
        function termEnable() {
            terminalSelector.querySelector(DEF_SETTINGS.terminal_input).removeAttribute("disabled", "")
            terminalSelector.querySelector(DEF_SETTINGS.terminal_input).focus()
        }
        function termDisable() {
            terminalSelector.querySelector(DEF_SETTINGS.terminal_input).setAttribute("disabled", "")
        }
        function termClearValue() {
            terminalSelector.querySelector(DEF_SETTINGS.terminal_input).value = ""
        }
        let termDelay = e=>new Promise(t=>setTimeout(t, e));
        function scrollTerminalToBottom() {
            terminal_console.scrollTop = terminal_console.scrollHeight
        }
        function scrollTerminalToTop() {
            terminal_console.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        }
        function addElementWithID(e, t, r) {
            let n = null;
            n = document.createElement("div"),
            r && n.setAttribute("class", r),
                n.setAttribute("id", e),
            t && (n.innerHTML = t),
                terminal_console.appendChild(n)
        }
        function removeElementWithID(e) {
            try {
                terminalSelector.querySelector("#" + e).outerHTML = ""
            } catch (t) {
                throw {
                    message: `Error could not find ${t.message}`
                }
            }
        }
        async function checkIfCommand() {
            let key = window.event.keyCode;
            if (0 != KEYCODES.filter(e=>e.key_code === key).length && (KEYCODES = KEYCODES.filter(e=>e.key_code === key),
            0 != KEYCODES.length && void 0 != KEYCODES[0].function))
                try {
                    await eval(KEYCODES[0].function)
                } catch (error) {
                    throw {
                        message: `KeyCode Function Error: ${error.message}`
                    }
                }
            !0 != InputState && key === Command_Key && (window.event.preventDefault && window.event.preventDefault(),
                termEcho(terminalSelector.querySelector(DEF_SETTINGS.terminal_input).value),
                termClearValue())
        }
        return !0 === DEF_SETTINGS.disable_terminal_input && terminalSelector.querySelector(DEF_SETTINGS.terminal_input).setAttribute("disabled", ""),
            {
                echo: termEcho,
                output: termOutput,
                clear: termClear,
                delay: termDelay,
                disable_input: termDisable,
                enable_input: termEnable,
                history: termHistory,
                input: termInput,
                mono_input: termMonoInput,
                password: termPassword,
                yes_no: termYesNo,
                continue: termContinue,
                scroll_to_bottom: scrollTerminalToBottom,
                scroll_to_top: scrollTerminalToTop,
                add_element: addElementWithID,
                remove_element: removeElementWithID,
                kill: termKill
            }
    } catch (error) {
        throw console.error(`Termino.js Error: ${error.message}`),
            {
                message: `Termino.js Error: ${error.message}`
            }
    }
}
"undefined" == typeof document && console.error("Termino.js is only supported for the browser");
