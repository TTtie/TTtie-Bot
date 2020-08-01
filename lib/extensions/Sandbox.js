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
// A huge wall of code describing much secure sandbox

const Extension = require("./API/Extension");
const Guild = require("./API/Guild");
const Member = require("./API/Member");
const Message = require("./API/Message");
const TextChannel = require("./API/TextChannel");
const User = require("./API/User");
const Constants = require("@tt-bot-dev/extension-runner/Constants");
const ResolveUserID = require("./Utils/ResolveUserID");
const ResolveChannelID = require("./Utils/ResolveChannelID");

module.exports = (ctx, bot, { id, name, data, flags }, { prefix, trigger, args }) => {
    const extStruct = new (Extension(ctx.db))(id, name, data, flags);
    class Bot {
        constructor(extStruct) {
            this.user = new User(extStruct, bot.user);
        }

        get guilds() {
            return bot.guilds.size;
        }

        get users() {
            return bot.users.size;
        }

        passesRoleHierarchy(member1, member2) {
            return bot.passesRoleHierarchy(member1, member2);
        }

        async waitForMessage(channel, author, check, timeout) {
            channel = ResolveChannelID(channel);
            author = ResolveUserID(author);
            if (!check) check = () => true;
            const ctx = await bot.messageAwaiter.waitForMessage({ channel: {
                id: channel
            }, author: {
                id: author
            } }, ctx => {
                return check(new Message(extStruct, ctx.msg));
            }, timeout);
            return new Message(ctx.msg);
        }
    }
    const instance = {
        bot: new Bot(extStruct),
        guild: new Guild(extStruct, ctx.guild),
        message: new Message(extStruct, ctx.msg),
        channel: new TextChannel(extStruct, ctx.channel),
        member: new Member(extStruct, ctx.member),
        author: new User(extStruct, ctx.author),
        extension: extStruct,
        Constants,
        command: {
            prefix, trigger, args
        },
    };

    const box = {
        require(mod) {
            if (mod === "tt.bot") return instance;
            else if (mod === "chainfetch" && flags & 1) return require("chainfetch");
            else if (mod === "node-fetch" && flags & 1) return require("node-fetch");
            else throw new Error(`Cannot find module "${mod}". Are you sure that you have correct extension flag to use it?`);
        },
        setTimeout,
        clearTimeout
    };
    if (flags & 1) box.fetch = require("node-fetch"); // WHATWG fetch support
    else box.fetch = () => {
        throw new Error("Insufficient permissions to use fetch(). Are you sure that you have correct extension flag to use it?");
    };
    return box;
};
