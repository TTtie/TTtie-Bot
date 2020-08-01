/**
 * Copyright (C) 2020 tt.bot dev team
 * 
 * This file is part of tt.bot.
 * 
 * tt.bot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * tt.bot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with tt.bot.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
const Command = require("../lib/commandTypes/OwnerCommand");
const { inspect } = require("util");
const ExtensionRunner = require("@tt-bot-dev/extension-runner");
const CensorBuilder = require("../lib/CensorBuilder");
const makeGist = require("../lib/gist");
const { prefix } = require("../config");
class RunExtensionCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "runextension",
            description: "Evaluates JavaScript code as an extension."
        });
    }

    async run(ctx, args) {
        const h = process.hrtime();
        const err = await ExtensionRunner(ctx, this.sosamba, args, {
            id: "eval",
            name: "Evaluated extension",
            data: {
                id: "evaluation"
            },
            flags: -1
        }, {
            prefix,
            trigger: "extension",
            args: ""
        });
        const [sec, nsec] = process.hrtime(h);
        console.log(sec, nsec / 1e6);
        let d = err || "Ran successfully!";
        const v = typeof d === "string" ? d : inspect(d);
        const description = `\`\`\`js\n${v.replace(new CensorBuilder([], this.sosamba).build(), "no.")}\n\`\`\``;
        if (description.length > 2048) {
            let gist;
            try {
                gist = await makeGist("exec.md", description, "Evaluated code");
                if (!gist.ok) throw new Error();
            } catch (err) {
                await ctx.send({
                    embed: {
                        title: "Evaluated!",
                        color: 0x008800,
                        description: "Unfortunately, we can't provide the data here because they're too long and the request to GitHub's Gist APIs has failed.\nThereby, the output has been logged in the console."
                    }
                });
                this.log.log(v);
                return;
            }
            return await ctx.send({
                embed: {
                    title: "Evaluated!",
                    color: 0x008800,
                    description: `The data are too long. [View the gist here](${gist.body.html_url})`
                }
            });
        } else {
            ctx.send({
                embed: {
                    description,
                    color: 0x008800
                }
            });
        }
    }
}

module.exports = RunExtensionCommand;