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
const { SwitchArgumentParser, Serializers: { Member } } = require("sosamba");
const UserProfile = require("../lib/Structures/UserProfile");
const { PunishTypes } = require("../lib/modlog/constants");

class StrikeCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "strike",
            description: "Strikes a user.",
            argParser: new SwitchArgumentParser(sosamba, {
                user: {
                    type: Member,
                    description: "the user to strike"
                },
                reason: {
                    type: String,
                    description: "the strike reason",
                    default: "No reason provided."
                }
            }),
            aliases: ["warn"]
        });
    }

    async run(ctx, { user, reason }) {
        if (user.bot) return ctx.send(await ctx.t("BOTS_NOT_STRIKABLE"));
        await this.sosamba.modLog.createPunishment(ctx, PunishTypes.STRIKE, user.id, reason);
        const dm = await user.user.getDMChannel();
        const p = await ctx.db.getUserProfile(user.id);
        const prof = new UserProfile(p || {});
        try {
            await dm.createMessage({
                embed: {
                    title: await this.sosamba.i18n.getTranslation("YOU_GOT_STRIKED", prof.locale || "en"),
                    description: await this.sosamba.i18n.getTranslation("STRIKE_DETAILS", prof.locale || "en", this.sosamba.getTag(ctx.author), reason),
                    footer: {
                        text: await this.sosamba.i18n.getTranslation("PAY_ATTENTION", prof.locale || "en")
                    },
                    timestamp: new Date()
                }
            });
        } catch {}
        await ctx.send(":ok_hand:");
    }
}

module.exports = StrikeCommand;
