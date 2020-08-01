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
const { Command, SerializedArgumentParser, Eris: {
    User
} } = require("sosamba");
const UserProfile = require("../lib/Structures/UserProfile");
const moment = require("moment");
const { tzDateFormat } = require("../config");

class TimeForCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "timefor",
            argParser: new SerializedArgumentParser(sosamba, {
                args: [{
                    default: ctx => ctx.author,
                    name: "user",
                    rest: true,
                    type: User,
                    description: "the user to get the time for"
                }]
            }),
            description: "Gets the current time of a user.",
            aliases: ["tf"]
        });
    }

    async run(ctx, [user]) {
        const profile = await ctx.db.getUserProfile(user.id);
        if (!profile) return await ctx.send(
            await ctx.t(`PROFILE${user.id === ctx.author.id ? "" : "_SPECIFIC"}_NONEXISTENT`,
                this.sosamba.getTag(user)));
        const data = new UserProfile(profile);
        if (!data.timezone) return await ctx.send(await ctx.t("NO_TZ"));
        return ctx.send(await ctx.t("TIME_FOR",
            moment(new Date()).tz(data.timezone)
                .format(tzDateFormat), this.sosamba.getTag(user)));
    }
}

module.exports = TimeForCommand;
