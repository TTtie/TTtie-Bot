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
const Command = require("../lib/commandTypes/ModCommand");
const { SimpleArgumentParser } = require("sosamba");
const { version: sosambaVersion } = require("sosamba/package.json");

class UpdateReasonCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "reason",
            args: "<caseID:String> <reason:String...>",
            argParser: new SimpleArgumentParser(sosamba, {
                separator: " "
            }),
            description: "Updates the reason for a strike."
        });
    }

    async run(ctx, [caseID, ...reason]) {
        if (!caseID) {
            await ctx.send({
                embed: {
                    title: ":x: Argument required",
                    description: "The argument `caseID` is required.",
                    color: 0xFF0000,
                    footer: {
                        text: `Sosamba v${sosambaVersion}`
                    }
                }
            });
            return;
        }
        if (reason.length === 0) {
            await ctx.send({
                embed: {
                    title: ":x: Argument required",
                    description: "The argument `reason` is required.",
                    color: 0xFF0000,
                    footer: {
                        text: `Sosamba v${sosambaVersion}`
                    }
                }
            });
            return;
        }
        try {
            await this.sosamba.modLog.updateReason(caseID, ctx, reason.join(" "));
        } catch(err) {
            await ctx.send(await ctx.t("ERROR", err));
            return;
        }
        await ctx.send(":ok_hand:");
    }
}

module.exports = UpdateReasonCommand;