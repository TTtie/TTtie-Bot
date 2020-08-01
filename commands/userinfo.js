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
const { Command, SerializedArgumentParser,
    Serializers: { Member } } = require("sosamba");
const userByID = require("../lib/util/userByID");
const moment = require("moment");
const config = require("../config");

class UserCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "userinfo",
            argParser: new SerializedArgumentParser(sosamba, {
                args: [{
                    default: ctx => ctx.member,
                    type: [Member, userByID],
                    rest: true,
                    name: "user",
                    description: "the user to get the information for"
                }]
            }),
            description: "Gets some information about the user.",
            aliases: ["uinfo"]
        });
    }

    async run(ctx, [user]) {
        if (user instanceof Member) {
            const roles = user.roles.map(r => ctx.guild.roles.get(r).name);
            roles.unshift("@everyone");
            const nick = user.nick || this.sosamba.getTag(user);
            ctx.send({
                embed: {
                    title: await ctx.t("USER_INFO", `${nick} ${nick === this.sosamba.getTag(user) ? "" : `(${this.sosamba.getTag(user)})`} (${user.id}) ${user.bot ? "(BOT)" : ""}`),
                    thumbnail: {
                        url: user.user.avatarURL
                    },
                    fields: [{
                        name: await ctx.t("ROLES"),
                        value: roles.join(", ").length > 1024 ? await ctx.t("TOOLONG") : roles.join(", "),
                        inline: false
                    }, {
                        name: await ctx.t("CREATED_ON"),
                        value: await ctx.userProfile && (await ctx.userProfile).timezone ?
                            moment(new Date(user.createdAt)).tz((await ctx.userProfile).timezone).format(config.tzDateFormat) :
                            moment(new Date(user.createdAt)).format(config.normalDateFormat),
                        inline: true
                    }, {
                        name: await ctx.t("CURRENT_VOICE"),
                        value: ctx.guild.voiceStates.has(user.id) ?
                            ctx.guild.channels.get(ctx.guild.voiceStates.get(user.id).channelID)
                                .name : await ctx.t("NONE"),
                        inline: true
                    }],
                    timestamp: new Date(user.joinedAt),
                    footer: {
                        text: await ctx.t("JOINED_ON")
                    }
                }
            });
        } else {
            await ctx.send({
                embed: {
                    title: await ctx.t("USER_INFO", `${this.sosamba.getTag(user)} ${user.bot ? "(BOT)" : ""}`),
                    thumbnail: {
                        url: user.avatarURL
                    },
                    fields: [{
                        name: await ctx.t("CREATED_ON"),
                        value: await ctx.userProfile && (await ctx.userProfile).timezone ?
                            moment(new Date(user.createdAt)).tz((await ctx.userProfile).timezone).format(config.tzDateFormat) :
                            moment(new Date(user.createdAt)).format(config.normalDateFormat),
                        inline: true
                    }],
                    footer: {
                        // NOT_IN_SERVER
                        text: "They're not in this server, so that's everything I know 😥"
                    }
                }
            });
        }
        
    }
}

module.exports = UserCommand;