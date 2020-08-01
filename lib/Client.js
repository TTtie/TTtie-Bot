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
const { Client, Eris: { Base, User } } = require("sosamba");
const s = require("chainfetch");
const ErisEndpoints = require("../node_modules/eris/lib/rest/Endpoints");
const ModLog = require("./modlog");
const WorkerManager = require("./util/worker");
const resolveInvite = require("./util/resolveInvite");
const OwnerCommand = require("./commandTypes/OwnerCommand");
const DBProvider = require("./DBProvider");
class TTBotClient extends Client {
    constructor(token, options, db) {
        super(token, options);
        this.modLog = new ModLog(this);
        this.workers = new WorkerManager();
        const dbClass = db.provider(this);
        if (!(dbClass.prototype instanceof DBProvider))
            throw new Error("The database provider must inherit from the DBProvider class");
        this.db = new dbClass(db.options);
    }

    async postStatsTo(key = "", url = "", pld = { server_count: this.guilds.size }) {
        if (!key || !url || !pld) return;
        const data = await s.post(url)
            .set("Authorization", key)
            .send(pld)
            .toJSON();
        if (!data.ok) throw new Error(`${data.status} ${data.statusText}\n${JSON.stringify(data.body, null, 4)}`);
        return;
    }
    passesRoleHierarchy(invoker, member) {
        if (!invoker) return false;
        if (!member) return true;
        if (invoker.guild.id !== member.guild.id) throw new TypeError("Members aren't in the same guild");
        if (invoker.guild.ownerID === invoker.id) return true;
        if (invoker.guild.ownerID === member.id) return false;
        if (invoker.roles.length === 0) return false;
        if (member.roles.length === 0) return true;
        const member1Roles = invoker.roles.map(r => invoker.guild.roles.get(r))
            .sort((a, b) => b.position - a.position);
        const member2Roles = member.roles.map(r => member.guild.roles.get(r))
            .sort((a, b) => b.position - a.position);
        return member1Roles[0].position > member2Roles[0].position;
    }
    async isModerator(member, botOwnerIsMod = true) {
        if (this.isAdmin(member, botOwnerIsMod)) return true;
        const server = await this.db.getGuildConfig(member.guild.id);
        const defaultModRole = member.guild.roles
            .find(r => r.name.toLowerCase() === "tt.bot mod");
        return member.roles.includes(server && server.modRole
            ? server.modRole
            : defaultModRole && defaultModRole.id);
    }

    isAdmin(member, botOwnerIsAdmin = true) {
        if (botOwnerIsAdmin && OwnerCommand.prototype.permissionCheck.call(null, {
            author: member.user
        })) return true;
        if (member.permission.has("manageGuild")) return true;
        if (member.guild.ownerID === member.id) return true;
    }

    get botCollectionServers() {
        return this.guilds.filter(g => g.members.filter(member => member.bot).length / g.memberCount * 100 >= 75);
    }
    // eslint disable no-useless-escape
    escapeMarkdown(string) {
        const replacedItallicsAndBold = string.replace(/\*/g, "\\*");
        const replacedBackticks = replacedItallicsAndBold.replace(/\`/g, "\\`");
        const replacedUnderscores = replacedBackticks.replace(/\_/g, "\\_");
        const replacedBrackets = replacedUnderscores.replace(/\[/g, "\\[").replace(/\(/, "\\(").replace(/\]/g, "\\]").replace(/\)/g, "\\)");
        return replacedBrackets;
    }
    //actually Client.getRESTUser, but bypasses the need of options.restMode
    getUserWithoutRESTMode(userID) {
        if (this.users.has(userID)) return Promise.resolve(this.users.get(userID));
        return this.requestHandler.request("GET", ErisEndpoints.USER(userID), true).then((user) => new User(user, this));
    }

    getBaseObject(id) {
        return new Base(id);
    }

    getTag(user) {
        return `${user.username}#${user.discriminator}`;
    }

    embedToText(embed) {
        let txt = [];
        if (embed.title) txt.push(`----------${embed.title} ${embed.url ? `- ${embed.url}` : ""}----------`);
        if (embed.author) txt.push(`${embed.title ? "(" : ""}${embed.author.name || "noname"} - ${embed.author.icon_url || "noiconuri"} - ${embed.author.url || "nouri"}${embed.title ? ")" : ""}`);
        if (embed.description) txt.push(embed.description);
        if (embed.fields) embed.fields.forEach(f => {
            txt.push("--------------------");
            txt.push(f.name);
            txt.push("");
            txt.push(f.value);
            txt.push("--------------------");
        });
        if (embed.thumbnail) txt.push("THUMB: " + embed.thumbnail.url);
        if (embed.image) txt.push(`IMAGE: ${embed.image.url}`);
        if (embed.video) txt.push(`VIDEO: ${embed.video.url}`);
        if (embed.provider) txt.push(`PROVIDER: ${embed.provider.name} ${embed.provider.url}`);
        if (embed.footer) txt.push(`----------${embed.footer.text || "notext"} - ${embed.footer.icon_url || "noiconuri"}----------`);
        return txt.join("\n");
    }
    parseMsg(string, m, g) {
        const replacers = {
            "{g.name}": g.name,
            "{g.id}": g.id,
            "{g.channels}": g.channels.size,
            "{g.members}": g.memberCount,
            "{g.roles}": g.roles.size,
            "{u.mention}": `<@!${m.id}>`,
            "{u.name}": m.username,
            "{u.discrim}": m.discriminator,
            "{u.id}": m.id,
            "{u.tag}": this.getTag(m),
        };
        const regex = new RegExp(Object.keys(replacers).map(t => t.replace(/\./g, "\\.")).join("|"), "gi");
        return string.replace(regex, m => replacers[m]);
    }

    waitForEvent(event, timeout, check) {
        //eslint-disable-next-line no-unused-vars
        let t;
        if (!check || typeof check !== "function") check = () => true;
        return new Promise((rs, rj) => {
            const listener = (...args) => {
                if (check && typeof check === "function" && check(...args) === true) {
                    dispose();
                    rs([...args]);
                    return;
                }
            };
            const dispose = () => {
                this.removeListener(event, listener);
            };

            if (timeout) t = setTimeout(() => {
                dispose();
                rj("timeout");
            }, timeout);
            this.on(event, listener);
        });
    }

    getInvite(inviteID, withCounts) {
        const parsed = resolveInvite(inviteID);
        return super.getInvite(parsed, withCounts);
    }
}
module.exports = TTBotClient;