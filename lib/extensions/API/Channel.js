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
const { TextChannel: tc, NewsChannel, VoiceChannel: vc, CategoryChannel: cc } = require("sosamba").Eris;

let CategoryChannel, TextChannel, VoiceChannel, Guild, ResolveChannelID;
const r = require("../Utils/InterceptReason");
const resolveRoleOrUser = require("../Utils/ResolveRoleOrUserID");
const resolveUser = require("../Utils/ResolveUserID");
const checkPermission = require("../Utils/CheckPrivilege");
const Consts = require("@tt-bot-dev/extension-runner/Constants");
const Base = require("./Base");
process.nextTick(() => {
    CategoryChannel = require("./CategoryChannel");
    TextChannel = require("./TextChannel");
    VoiceChannel = require("./VoiceChannel");
    Guild = require("./Guild");
    ResolveChannelID = require("../Utils/ResolveChannelID");
});

class Channel extends Base {
    constructor(extension, channel) {
        super(extension, channel);
        Object.defineProperty(this, "guild", {
            get: function () {
                return new Guild(extension, channel.guild);
            },
            configurable: true
        });
        this.mention = channel.mention;
        this.name = channel.name;
        this.nsfw = channel.nsfw;

        Object.defineProperty(this, "parent", {
            get: function () {
                if (!channel.parentID || channel.type === Consts.ChannelTypes.category) return null;
                return new CategoryChannel(extension, channel.guild.channels.get(channel.parentID));
            }
        });
        this.permissionOverwrites = channel.permissionOverwrites;
        this.position = channel.position;
        this.type = channel.type;

        Object.defineProperty(this, "delete", {
            value: function (reason) {
                try {
                    checkPermission(extension, "dangerousGuildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }

                if (!channel.guild.shard.client.hasBotPermission(channel, "manageChannels")) {
                    return Promise.resolve(false);
                }
                return channel.delete(r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "deletePermission", {
            value: function (overwrite, reason) {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                if (!channel.guild.shard.client.hasBotPermission(channel, "manageRoles")) {
                    return Promise.resolve(false);
                }
                overwrite = resolveRoleOrUser(overwrite);
                return channel.deletePermission(overwrite, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "edit", {
            value: function (options, reason) {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                if (!channel.guild.shard.client.hasBotPermission(channel, "manageChannels")) {
                    return Promise.resolve(false);
                }
                const o = Object.assign({}, options);
                if (o.parentID) o.parentID = ResolveChannelID(o.parentID);
                return channel.edit(o, r(extension, reason)).then(c => {
                    if (c instanceof tc || c instanceof NewsChannel) return new TextChannel(extension, c);
                    if (c instanceof vc) return new VoiceChannel(extension, c);
                    if (c instanceof cc) return new CategoryChannel(extension, c);
                    return new Channel(extension, c);
                }).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "editPermission", {
            value: function (overwrite, allow, deny, type, reason) {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                if (!channel.guild.shard.client.hasBotPermission(channel, "manageRoles")) {
                    return Promise.resolve(false);
                }
                overwrite = resolveRoleOrUser(overwrite);
                return channel.editPermission(overwrite, allow, deny, type, r(extension, reason)).then(p => p).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "editPosition", {
            value: function (position) {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = channel.guild.members.get(channel.guild.shard.client.user.id);
                if (!me.permission.has("manageChannels")) {
                    return Promise.resolve(false);
                }
                return channel.editPosition(position).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "permissionsOf", {
            value: function (member) {
                member = resolveUser(member);
                return channel.permissionsOf(member);
            },
            configurable: true
        });
    }

    toString() {
        return this.mention;
    }
}

module.exports = Channel;
