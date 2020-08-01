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
const { Collection } = require("eris");
const { TextChannel: tc, NewsChannel, VoiceChannel: vc, CategoryChannel: cc } = require("sosamba").Eris;
const ResolveUserID = require("../Utils/ResolveUserID");
const ResolveRoleID = require("../Utils/ResolveRoleID");
const ResolveChannelID = require("../Utils/ResolveChannelID");
const r = require("../Utils/InterceptReason");
const checkPermission = require("../Utils/CheckPrivilege");
const { ChannelTypes } = require("@tt-bot-dev/extension-runner/Constants");
const User = require("./User");
const Invite = require("./Invite");
const Member = require("./Member");
const Base = require("./Base");
let TextChannel, VoiceChannel, CategoryChannel, Role, GuildAuditLogEntry, Channel;
process.nextTick(() => {
    CategoryChannel = require("./CategoryChannel");
    TextChannel = require("./TextChannel");
    VoiceChannel = require("./VoiceChannel");
    Role = require("./Role");
    GuildAuditLogEntry = require("./GuildAuditLogEntry");
    Channel = require("./Channel");
});
class Guild extends Base {
    constructor(extension, guild) {
        super(extension, guild);
        this.afkChannelID = guild.afkChannelID;
        this.afkTimeout = guild.afkTimeout;
        this.banner = guild.banner;
        this.bannerURL = guild.bannerURL;
        Object.defineProperty(this, "channels", {
            get: function () {
                const coll = new Collection(Channel);
                guild.channels.forEach(c => {
                    let ch = class { };
                    if (ch instanceof tc || ch instanceof NewsChannel) ch = TextChannel;
                    else if (ch instanceof vc) ch = VoiceChannel;
                    else if (ch instanceof cc) ch = CategoryChannel;
                    else ch = Channel;
                    coll.add(new ch(extension, c));
                });
                return coll;
            }
        });
        this.defaultNotifications = guild.defaultNotifications;
        this.description = guild.description;
        this.emojis = guild.emojis;
        this.explicitContentFilter = guild.explicitContentFilter;
        this.features = guild.features;
        this.icon = guild.icon;
        this.iconURL = guild.iconURL;
        this.joinedAt = guild.joinedAt;
        this.large = guild.large;
        this.maxMembers = guild.maxMembers;
        this.maxPresences = guild.maxPresences;
        this.memberCount = guild.memberCount;
        Object.defineProperty(this, "members", {
            get: function () {
                const coll = new Collection(Member);
                guild.members.forEach(m => {
                    coll.add(new Member(extension, m));
                });
                return coll;
            },
            configurable: true
        });
        Object.defineProperty(this, "me", {
            get: function () {
                return new Member(extension, guild.members.get(guild.shard.client.user.id));
            },
            configurable: true
        });
        this.mfaLevel = guild.mfaLevel;
        this.name = guild.name;
        this.ownerID = guild.ownerID;
        Object.defineProperty(this, "owner", {
            get: function () {
                return new Member(extension, guild.members.get(guild.ownerID));
            },
            configurable: true
        });
        this.preferredLocale = guild.preferredLocale;
        this.premiumSubscriptionCount = guild.premiumSubscriptionCount;
        this.premiumTier = guild.premiumTier;
        Object.defineProperty(this, "roles", {
            get: function () {
                const coll = new Collection(Role);
                guild.roles.forEach(m => {
                    coll.add(new Role(extension, m));
                });
                return coll;
            },
            configurable: true
        });
        this.splash = guild.splash;
        this.splashURL = guild.splashURL;
        this.systemChannelID = this.joinMessageChannelID = guild.systemChannelID;
        this.unavailable = guild.unavailable;
        this.vanityURL = guild.vanityURL;
        this.verificationLevel = guild.verificationLevel;

        Object.defineProperty(this, "addMemberRole", {
            value: function (member, role, reason) {
                try {
                    checkPermission(extension, "guildMembersMeta");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                member = ResolveUserID(member);
                role = ResolveRoleID(role);
                if (!me.permission.has("manageRoles")
                    || !guild.shard.client.passesRoleHierarchy(me, {
                        guild,
                        roles: [role]
                    })) {
                    return Promise.resolve(false);
                }
                return guild.addMemberRole(member, role, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "banMember", {
            value: function (user, deleteMessageDays, reason) {
                try {
                    checkPermission(extension, "guildModerative");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                user = ResolveUserID(user);
                if (!me.permission.has("banMembers")
                    || !guild.shard.client.passesRoleHierarchy(me, guild.members.get(user))) {
                    return Promise.resolve(false);
                }

                return guild.banMember(user, deleteMessageDays, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "createChannel", {
            value: function (name, type, reason, parent) {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("manageChannels")) {
                    return Promise.resolve(false);
                }
                // We don't need to send a request for an invalid type, right?
                if (type !== ChannelTypes.text && type !== ChannelTypes.voice && type !== ChannelTypes.category) return Promise.reject(false);
                parent = ResolveChannelID(parent);
                return guild.createChannel(name, type, r(extension, reason), parent).then(c => {
                    if (c instanceof tc) return new TextChannel(extension, c);
                    if (c instanceof vc) return new VoiceChannel(extension, c);
                    if (c instanceof cc) return new CategoryChannel(extension, c);
                    // Whatever, we do not speak that
                    return false;
                }).catch(() => false);
            },
            configurable: true
        });
        Object.defineProperty(this, "createEmoji", {
            value: function (options, reason) {
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("manageEmojis")) {
                    return Promise.resolve(false);
                }
                const o = Object.assign({}, options); // Let their options be
                if (o.roles) o.roles = o.roles.map(r => ResolveRoleID(r));
                return guild.createEmoji(o, r(extension, reason)).then(e => e).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "createRole", {
            value: function (options, reason) {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("manageRoles")) {
                    return Promise.resolve(false);
                }
                return guild.createRole(options, r(extension, reason)).then(r => new Role(extension, r)).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "deleteEmoji", {
            value: function (emojiID, reason) {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("manageEmojis")) {
                    return Promise.resolve(false);
                }
                return guild.deleteEmoji(emojiID, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "deleteRole", {
            value: function (role, reason) {
                try {
                    checkPermission(extension, "dangerousGuildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                role = ResolveRoleID(role);
                if (!me.permission.has("manageRoles")
                    || !guild.shard.client.passesRoleHierarchy(me, {
                        guild,
                        roles: [role]
                    })) {
                    return Promise.resolve(false);
                }
                return guild.deleteRole(role, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "dynamicIconURL", {
            value: function (format, size) {
                return guild.dynamicIconURL(format, size);
            },
            configurable: true
        });
        Object.defineProperty(this, "dynamicSplashURL", {
            value: function (format, size) {
                return guild.dynamicSplashURL(format, size);
            },
            configurable: true
        });
        Object.defineProperty(this, "dynamicBannerURL", {
            value: function (format, size) {
                return guild.dynamicBannerURL(format, size);
            },
            configurable: true
        });

        Object.defineProperty(this, "edit", {
            value: function (options, reason) {
                try {
                    checkPermission(extension, "dangerousGuildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("manageGuild")) {
                    return Promise.resolve(false);
                }
                return guild.edit(options, r(extension, reason)).then(g => new Guild(extension, g)).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "editEmoji", {
            value: function (emojiID, options, reason) {
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("manageEmojis")) {
                    return Promise.resolve(false);
                }
                return guild.editEmoji(emojiID, options, r(extension, reason)).then(o => o).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "editMember", {
            value: function (member, options, reason) {
                try {
                    checkPermission(extension, "guildMembersMeta");
                } catch (e) {
                    return Promise.reject(e);
                }
                member = ResolveUserID(member);
                const me = guild.members.get(guild.shard.client.user.id);
                if (!guild.shard.client
                    .passesRoleHierarchy(me, guild.members.get(member))) {
                    return Promise.resolve(false);
                }
                const o = Object.assign({}, options); // Let their options be
                if (o.roles) o.roles = o.roles.map(r => ResolveRoleID(r));
                return guild.editMember(member, o, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "editNickname", {
            value: function (nickname) {
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("changeNickname")) {
                    return Promise.resolve(false);
                }
                return guild.editNickname(nickname).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "editRole", {
            value: function (role, options, reason) {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                role = ResolveRoleID(role);
                if (!me.permission.has("manageRoles")
                    || !guild.shard.client.passesRoleHierarchy(me, {
                        guild,
                        roles: [role]
                    })) {
                    return Promise.resolve(false);
                }
                return guild.editRole(role, options, r(extension, reason)).then(r => new Role(extension, r)).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "getAuditLogs", {
            value: function (limit, before, actionType) {
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("viewAuditLogs")) {
                    return Promise.resolve(false);
                }
                return guild.getAuditLogs(limit, before, actionType).then(({ users, entries }) => ({
                    users: users.map(u => new User(extension, u)),
                    entries: entries.map(e => new GuildAuditLogEntry(extension, e))
                })).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "getBan", {
            value: function (user) {
                try {
                    checkPermission(extension, "guildModerative");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("banMembers")) {
                    return Promise.resolve(false);
                }
                user = ResolveUserID(user);
                return guild.getBan(user).then(({ reason, user }) => ({
                    reason,
                    user: new User(extension, user)
                })).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "getBans", {
            value: function () {
                try {
                    checkPermission(extension, "guildModerative");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("banMembers")) {
                    return Promise.resolve(false);
                }
                return guild.getBans().then(u => u.map(({ reason, user }) => ({
                    reason,
                    user: new User(extension, user)
                }))).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "getInvites", {
            value: function () {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("manageGuild")) {
                    return Promise.resolve(false);
                }
                return guild.getInvites().then(i => i.map(inv => new Invite(extension, inv))).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "getPruneCount", {
            value: function (days) {
                try {
                    checkPermission(extension, "dangerousGuildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("kickMembers")) {
                    return Promise.resolve(false);
                }
                return guild.getPruneCount(days).then(n => n).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "getWebhooks", {
            value: function () {
                try {
                    checkPermission(extension, "guildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("manageWebhooks")) {
                    return Promise.resolve(false);
                }
                return guild.getWebhooks().then(w => w).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "kickMember", {
            value: function (user, reason) {
                try {
                    checkPermission(extension, "guildModerative");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                user = ResolveUserID(user);
                if (!me.permission.has("kickMembers")
                    || !guild.shard.client.passesRoleHierarchy(me, guild.members.get(user))) {
                    return Promise.resolve(false);
                }
                return guild.kickMember(user, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "pruneMembers", {
            value: function (days, reason) {
                try {
                    checkPermission(extension, "dangerousGuildSettings");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("kickMembers")) {
                    return Promise.resolve(false);
                }
                return guild.pruneMembers(days, r(extension, reason)).then(n => n).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "removeMemberRole", {
            value: function (member, role, reason) {
                try {
                    checkPermission(extension, "guildMembersMeta");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                member = ResolveUserID(member);
                role = ResolveRoleID(role);
                if (!me.permission.has("manageRoles")
                    || !guild.shard.client.passesRoleHierarchy(me, {
                        guild,
                        roles: [role]
                    })) {
                    return Promise.resolve(false);
                }
                return guild.removeMemberRole(member, role, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });

        Object.defineProperty(this, "unbanMember", {
            value: function (user, reason) {
                try {
                    checkPermission(extension, "guildModerative");
                } catch (e) {
                    return Promise.reject(e);
                }
                const me = guild.members.get(guild.shard.client.user.id);
                if (!me.permission.has("banMembers")) {
                    return Promise.resolve(false);
                }
                user = ResolveUserID(user);
                return guild.unbanMember(user, r(extension, reason)).then(() => true).catch(() => false);
            },
            configurable: true
        });
    }

    // No.
    delete() {
        return Promise.resolve(false);
    }
}
module.exports = Guild;
