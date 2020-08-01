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
const { SwitchArgumentParser, Serializers: { Member } } = require("sosamba");
const { PunishTypes } = require("../lib/modlog/constants");
const Command = require("../lib/commandTypes/ModCommand");

class BanCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "ban",
            argParser: new SwitchArgumentParser(sosamba, {
                user: {
                    type: Member,
                    description: "the user to ban"
                },
                reason: {
                    type: String,
                    default: "No reason provided.",
                    description: "the optional reason for the ban"
                },
                soft: {
                    type: Boolean,
                    default: false,
                    description: "determines if the user will be unbanned immediately after banning."
                },
                days: {
                    type: Number,
                    default: 0,
                    description: "the amount of days worth of messages to purge"
                }
            }),
            description: "Bans a user."
        });
    }

    async permissionCheck(ctx) {
        return ctx.member.permission.has("banMembers") || await super.permissionCheck(ctx);
    }

    async run(ctx, { user, reason, soft, days }) {
        if (this.sosamba.passesRoleHierarchy(ctx.member, user)) {
            if (!this.sosamba.hasBotPermission(ctx.channel, "banMembers")) {
                await ctx.send(await ctx.t("MISSING_PERMISSIONS"));
                return;
            }
            await ctx.guild.banMember(user.id, days, encodeURIComponent(`${this.sosamba.getTag(ctx.author)}: ${reason}`));
            if (soft) await ctx.guild.unbanMember(user.id);
            this.sosamba.modLog.createPunishment(ctx, soft ? PunishTypes.SOFTBAN : PunishTypes.BAN, user.id, reason).catch(() => void 0);
            await ctx.send(await ctx.t(`${soft ? "SOFT": ""}BAN_DONE`, user.user));
        } else {
            ctx.send(await ctx.t("ROLE_HIERARCHY_ERROR"));
        }
    }
}

module.exports = BanCommand;
