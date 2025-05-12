/**
 * - This class' purpose is to make creating new commands as well as
 * describing them easier without the need of having to add them
 * one by one as some do, instead we can programatically add them
 * and describe them wherever one pleases as long as it calls
 * this class' `addCommand` method with the required params
 */
export class CommandHandler {
    constructor(moduleName) {
        /** @private */
        this.moduleName = moduleName
        /** @private */
        this.commands = {}
        /** @private */
        this.commandNames = []
        /** @private */
        this.mainCommand = null
        /** @private */
        this._register = null
        
        /** @private */
        this.titleFormat = "&8[&b${name}&8] &aCommand List"
        /** @private */
        this.commandFormat = "&a- ${name} &b${description}"
        /** @private */
        this.aliasFormat = "\n    &6- ${name}"
        /** @private */
        this.errorFormat = "&cCould not find command ${arg} in &b${name}'s &ccommand list"
        /** @private */
        this.tabCompletions = {}

        // Adding the "help" command since we are the ones supposed to handle that
        this.push("help", "Shows this list", () => {
            ChatLib.chat(this.titleFormat.replace("${name}", this.moduleName))
            const keys = Object.keys(this.commands)
            for (let k of keys) {
                let v = this.commands[k]
                let comp = new Message(
                    new TextComponent(this.commandFormat.replace("${name}", k).replace("${description}", v.description))
                        .setHover("show_text", `Click to run /${this.mainCommand} ${k}`)
                        .setClick("run_command", `/${this.mainCommand} ${k}`))

                if ("aliases" in v) {
                    for (let alias of v.aliases) {
                        comp.addTextComponent(new TextComponent(this.aliasFormat.replace("${name}", alias)).setHover("show_text", `This is an alias for /${this.mainCommand} ${k}`))
                    }
                }

                comp.chat()
            }
        })
    }

    /**
     * - Sets the `titleFormat` for this command handler
     * - `titleFormat` here refers to the first message that will be sent whenever
     * the command list is being displayed in this case the default will be
     * `&8[&bModuleName&8] &aCommand List`
     * @param {string} format The format has to look something like this `&8[&b${name}&8] &aCommand List`
     * where `${name}` basically tells this handler where the module name should be located at.
     * @returns {this} this for method chaining
     */
    setTitleFormat(format) {
        this.titleFormat = format

        return this
    }

    /**
     * - Sets the `commandFormat` for this command handler
     * - `commandFormat` here refers to every <command> <description> that will be displayed
     * in the user's chat, the default format is `&a- mycommand &bmy description`
     * @param {string} format The format has to look something like this `&a- ${name} &b${description}`
     * where `${name}` tells this command handler where the name of the command should be at
     * and `${description}` well you get it.
     * @returns {this} this for method chaining
     */
    setCommandFormat(format) {
        this.commandFormat = format

        return this
    }

    /**
     * - Sets the `aliasFormat` for this command handler
     * - `aliasFormat` here refers to every command's alias being displayed in chat
     * - The default format is `\n    &6- myAlias`
     * @param {string} format The format has to look something like this `\n    &6- ${name}`
     * where `${name}` tells this command handler where the name of the alias should be at
     * @returns {this} this for method chaining
     */
    setAliasFormat(format) {
        this.aliasFormat = format

        return this
    }

    /**
     * - Sets the `errorFormat` for this command handler
     * - `errorFormat` here refers to the error that is displayed whenever a command/subcommand is not found
     * - The default format is `"&cCould not find command ${arg} in &b${name}'s &ccommand list"`
     * @param {string} format The format has to look something like this `"&cCould not find command ${arg} in &b${name}'s &ccommand list"`
     * where `${arg}` tells this command handler where the arguments that the player passed through should be at
     * and `${name}` where the module name should be at
     * @returns {this} this for method chaining
     */
    setErrorFormat(format) {
        this.errorFormat = format

        return this
    }

    /**
     * - Sets the main command name
     * - Note: The command register is created here
     * @param {string} name The command name
     * @param {(args: ...any) => void|number} cb If you need anything to run inside of this command other
     * than what this handler is providing. If this callback returns a `1` it'll cancel the custom handler
     * made for this command.
     * @returns {this} this for method chaining
     */
    setName(name, cb) {
        this.mainCommand = name

        this._register = register("command", (...args) => {
            // If the user's callback function returns 1 that means we can cancel our custom handling
            if (cb?.call(null, ...args) === 1) return

            if (!args?.[0]) return

            const keys = Object.keys(this.commands)
            const arg = args[0].toLowerCase()
            let obj = null

            for (let k of keys) {
                if (obj) break
                let v = this.commands[k]

                if (k.startsWith(arg)) obj = v
                if (!obj && "aliases" in v) {
                    for (let alias of v.aliases) {
                        if (alias.startsWith(arg)) obj = v
                    }
                }
            }
            if (!obj) return ChatLib.chat(this.errorFormat.replace("${arg}", arg).replace("${name}", this.moduleName))

            obj.cb?.call(null, ...args.splice(1))
        })
            .setTabCompletions((arg) => {
                if (!arg?.[0]) return this.commandNames

                const result = this.commandNames.find((it) => it.startsWith(arg[0].toLowerCase()))
                if (!result) return []
                if (arg.length > 1) {
                    const name = arg[0].toLowerCase()
                    if (!(name in this.tabCompletions)) return []
                    return this.tabCompletions[name](...arg.splice(1)) || []
                }

                return [result]
            })
            .setName(name)

        return this
    }

    /**
     * - Adds a command that is a "subset" of the main command
     * - i.e. `/maincommand myexample` in this case `myexample` was added
     * through this function
     * @param {string} command The command name
     * @param {string} description The description of the command
     * @param {?(args: ...any) => void} cb The callback to run whenever this command is ran
     * @returns {this} this for method chaining
     */
    push(command, description, cb) {
        if (typeof description !== "string") throw `[tska - CommandHandler] ${description} is not a valid description`

        this.commands[command] = {
            description, cb, aliases: []
        }

        this.commandNames.push(command.toLowerCase())

        return this
    }

    /**
     * - Adds a command that is a "subset" of the main command
     * - i.e. `/maincommand myexample` in this case `myexample` was added
     * through this function
     * - Mostly the same as `push` but this one allows having aliases
     * @param {string} command The command name
     * @param {string[]} aliases The aliases for this command
     * @param {string} description The description of the command
     * @param {?(args: ...any) => void} cb The callback to run whenever this command is ran
     * @returns {this} this for method chaining
     */
    pushWithAlias(command, aliases = [], description, cb) {
        if (typeof description !== "string") throw `[tska - CommandHandler] ${description} is not a valid description`

        this.commands[command] = {
            description, cb, aliases
        }

        this.commandNames.push(command.toLowerCase())
        for (let alias of aliases)
            this.commandNames.push(alias.toLowerCase())

        return this
    }

    /**
     * - Sets an alias for this command
     * @param {string} name
     * @returns {this} this for method chaining
     */
    setAlias(name) {
        if (!this._register) throw "[tska - CommandHandler] seems like you did not call setName() before-hand"
        this._register.setAliases(name)

        return this
    }

    /**
     * - Sets an alias for this command
     * @param {string[]} args
     * @returns {this} this for method chaining
     */
    setAliases(...args) {
        if (!this._register) throw "[tska - CommandHandler] seems like you did not call setName() before-hand"
        this._register.setAliases(args)

        return this
    }

    /**
     * - Sets a tab completion for the specified sub command name
     * @param {string} commandName The sub command name
     * @param {(...args: string) => string[]} cb The callback that will run
     * Note: This has to return an array with strings
     * @returns {this} this for method chaining
     */
    setTabCompletion(commandName, cb) {
        this.tabCompletions[commandName.toLowerCase()] = cb

        for (let name of this.commands[commandName].aliases)
            this.tabCompletions[name] = cb

        return this
    }
}