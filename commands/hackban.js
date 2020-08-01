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
const { SimpleArgumentParser } = require("sosamba");
const Command = require("../lib/commandTypes/ModCommand");
const { version: sosambaVersion } = require("sosamba/package.json");

class HackbanCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "hackban",
            args: "<users:String...>",
            argParser: new SimpleArgumentParser(sosamba, {
                separator: " ",
                filterEmptyArguments: true
            }),
            description: "Bans an user by ID."
        });
    }

    async permissionCheck(ctx) {
        return ctx.member.permission.has("banMembers") || await super.permissionCheck(ctx);
    }

    async run(ctx, users) {
        if (users.length === 0) {
            await ctx.send({
                embed: {
                    title: ":x: Argument required",
                    description: "The argument `users` is required.",
                    color: 0xFF0000,
                    footer: {
                        text: `Sosamba v${sosambaVersion}`
                    }
                }
            });
        } else {
            if (!this.sosamba.hasBotPermission(ctx.channel, "banMembers")) {
                await ctx.send(await ctx.t("MISSING_PERMISSIONS"));
                return;
            }
            const send = users.length === 1;
            if (send) {
                await this.doBan(ctx, users[0], true, false);
            } else {
                const bans = await Promise.all(users.map(
                    u => this.doBan(ctx, u, false, true)
                ));
                await ctx.send(await ctx.t("HACKBANNED_USERS", bans.filter(b => b).length));
            }
        }
    }

    async doBan(ctx, id, send, mass) {
        const [ member ] = await this.sosamba.memberRequester.request(ctx.guild, [ id ]);
        try {
            if (member && !ctx.sosamba.passesRoleHierarchy(ctx.member, member)) {
                await ctx.send(await ctx.t("ROLE_HIERARCHY_ERROR"));
                return false;
            }
            await ctx.guild.banMember(id, 0, 
                `${mass === false ? "Hackbanned" : "Masshackbanned"} by ${ctx.sosamba.getTag(ctx.author)}`);
            if (send) await ctx.send(await ctx.t("BAN_DONE", member || { username: `Unknown User (${id})`, discriminator: "0000" }));
            return true;   
        } catch (e) {
            console.error(e);
            if (send) await ctx.send(await ctx.t("MISSING_PERMISSIONS"));
            return false;
        }
    }
}

module.exports = HackbanCommand;
