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
// const message = require("./modlog/messagetemplate");
const { PunishTypes, PunishTexts, PunishColors } = require("./modlog/constants");
const uuidregex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const { v4: createUUID } = require("uuid");
const { prefix } = require("../config.js");


class ModLog {
    constructor(bot) {
        this.bot = bot;
    }

    async makeLogMessage(userID, ctx, punishment, oldObject) {
        const user = userID && await this.bot.getUserWithoutRESTMode(userID); // just if someone decided to leave the guild while getting the data
        const { modlogChannel } = await ctx.guildConfig;
        const channel = ctx.guild.channels.get(modlogChannel);
        if (!channel) return;
        return await channel.createMessage({
            content: punishment.id,
            embed: this.templateMessage(punishment, user, ctx.author, oldObject)
        });
    }

    async getUserStrikes(userID, ctx) {
        const guildID = ctx.guild.id;
        let guildStrikes = await ctx.db.getGuildModlog(guildID);
        if (!guildStrikes) guildStrikes = await ctx.db.insertNewModlog(guildID);
        const { items } = guildStrikes;
        return items.filter(s => s.type === PunishTypes.STRIKE && s.userID === userID);
    }

    async generateObj(userID, reason, type) {
        return {
            id: createUUID(),
            userID, reason, type,
            messageID: null
        };
    }

    async createPunishment(ctx, type, userID, reason) {
        if (!ctx.guild.channels.get((await ctx.guildConfig).modlogChannel)) return;
        if (userID && type === PunishTypes.STRIKE) {
            if (await this.bot.isModerator(ctx.guild.members.get(userID), false)) throw new Error(await ctx.t("MODS_UNSTRIKABLE"));
        }
        let guildPunishments = await this.bot.db.getGuildModlog(ctx.guild.id);
        if (!guildPunishments) {
            guildPunishments = await this.bot.db.insertNewModlog(ctx.guild.id);
        }

        const { items: punishments } = guildPunishments;

        const punishment = {
            id: createUUID(),
            userID,
            reason,
            type,
            messageID: null
        };

        const punishmentLog = await this.makeLogMessage(userID, ctx, punishment);
        if (!punishmentLog) throw new Error("Cannot create a modlog notification");
        punishment.messageID = punishmentLog.id;

        punishments.push(punishment);
        await this.bot.db.updateModlog(ctx.guild.id, { items: punishments });
    }

    /*async addStrikeExtension(userID, guild, reason) {
        const guildID = guild.id;
        const config = await this.bot.db.getGuildConfig(guild.id);
        if (!config) return;
        if (!guild.channels.get(config.modlogChannel)) return;
        if (await this.bot.isModerator(guild.members.get(userID), false)) throw new Error();
        let guildStrikes = await this.bot.db.getGuildModlog(guildID);
        if (!guildStrikes) guildStrikes = await this.bot.db.insertNewModlog(guildID);
        const { items } = guildStrikes;
        const dataobj = await this.generateObj(userID, reason, PunishTypes.STRIKE);
        const m = await this.makeLogMessage(userID, dataobj.id, PunishTypes.STRIKE, { guild, guildConfig: config, author: this.bot.user }, reason);
        if (!m) throw "Cannot make modlog message";
        dataobj.messageID = m.id;
        items.push(dataobj);
        await this.bot.db.updateModlog(guildID, { items });
    }

    async addStrike(userID, msg, reason) {
        if (!msg.guild.channels.get((await msg.guildConfig).modlogChannel)) return;
        if (await this.bot.isModerator(msg.guild.members.get(userID), false)) throw msg.t("MODS_UNSTRIKABLE");
        const guildID = msg.guild.id;
        let guildStrikes = await this.bot.db.getGuildModlog(guildID);
        if (!guildStrikes) guildStrikes = await this.bot.db.insertNewModlog(guildID);
        const { items } = guildStrikes;
        const dataobj = await this.generateObj(userID, reason, PunishTypes.STRIKE);
        const m = await this.makeLogMessage(userID, dataobj.id, PunishTypes.STRIKE, msg, reason);
        if (!m) throw "Cannot make modlog message";
        dataobj.messageID = m.id;
        items.push(dataobj);
        await this.bot.db.updateModlog(guildID, { items });
    }

    async addBan(userID, msg, reason, isSoft) {
        if (!msg.guild.channels.get((await msg.guildConfig).modlogChannel)) return;
        const t = isSoft ? PunishTypes.SOFTBAN : PunishTypes.BAN;
        const guildID = msg.guild.id;
        let guildStrikes = await this.bot.db.getGuildModlog(guildID);
        if (!guildStrikes) guildStrikes = await this.bot.db.insertNewModlog(guildID);
        const { items } = guildStrikes;
        const dataobj = await this.generateObj(userID, reason, t);
        const m = await this.makeLogMessage(userID, dataobj.id, t, msg, reason);
        dataobj.messageID = m.id;
        items.push(dataobj);
        await this.bot.db.updateModlog(guildID, { items });
    }

    async addKick(userID, msg, reason) {
        if (!msg.guild.channels.get((await msg.guildConfig).modlogChannel)) return;
        const guildID = msg.guild.id;
        let guildStrikes = await this.bot.db.getGuildModlog(guildID);
        if (!guildStrikes) guildStrikes = await this.bot.db.insertNewModlog(guildID);
        const { items } = guildStrikes;
        const dataobj = await this.generateObj(userID, reason, PunishTypes.KICK);
        const m = await this.makeLogMessage(userID, dataobj.id, PunishTypes.KICK, msg, reason);
        dataobj.messageID = m.id;
        items.push(dataobj);
        await this.bot.db.updateModlog(guildID, { items });
    }*/

    async removeStrike(strikeID, ctx, reason) {
        if (!ctx.guild.channels.get((await ctx.guildConfig).modlogChannel)) return;
        if (!uuidregex.test(strikeID)) throw new Error("Invalid case ID");

        let guildStrikes = await this.bot.db.getGuildModlog(ctx.guild.id);
        if (!guildStrikes) guildStrikes = await this.bot.db.insertNewModlog(ctx.guild.id);
        const { items } = guildStrikes;

        const strike = items.find(k => k.id === strikeID && k.type === PunishTypes.STRIKE);
        if (!strike) throw new Error("Strike not found");
        strike.type = PunishTypes.REMOVED_STRIKE;
        const newItem = {
            id: createUUID(),
            userID: strike.userID,
            reason,
            type: PunishTypes.STRIKE_REMOVE,
            messageID: null
        };
        items.push(newItem);
        const message = await this.makeLogMessage(strike.userID, ctx, newItem, strike);
        newItem.messageID = message.id;
        await this.bot.db.updateModlog(ctx.guild.id, { items });
    }

    async updateReason(itemID, ctx, newReason) {
        if (!uuidregex.test(itemID)) throw new Error("Invalid case ID");

        let guildStrikes = await this.bot.db.getGuildModlog(ctx.guild.id);
        if (!guildStrikes) {
            guildStrikes = await this.bot.db.insertNewModlog(ctx.guild.id);
        }
        const { items } = guildStrikes;
        const punishment = items.find(k => k.id === itemID);

        if (!punishment) throw new Error("Infraction not found");
        punishment.reason = newReason;
        // ??
        // if (!punishment.userID) dataobj.userID = msg.author.id;
        await this.updateMessage(punishment, ctx);
        await this.bot.db.updateModlog(ctx.guild.id, { items });
    }

    async updateMessage(punishment, msg) {
        const modlogChannel = msg.guild.channels.get((await msg.guildConfig).modlogChannel);
        if (!modlogChannel) return;
        const modlogMessage = await modlogChannel.getMessage(punishment.messageID);
        const user = punishment.userID && (this.bot.users.get(punishment.userID) || await this.bot.getUserWithoutRESTMode(punishment.userID));
        const embed = this.templateMessage(punishment, user, msg.author);
        await modlogMessage.edit({ embed });
    }

    templateMessage(punishment, punished, punisher, oldObject) {
        return {
            title: `${PunishTexts[punishment.type] || "Unknown type"} ${punishment.id ? `| ${punishment.id}` : ""}`,
            author: punished && {
                name: this.bot.getTag(punished),
                icon_url: punished.avatarURL
            },
            fields: [{
                name: "Reason",
                value: punishment.reason || "No reason provided."
            },
            ...punishment.type === PunishTypes.STRIKE_REMOVE ? [{
                name: "Strike ID",
                value: oldObject.id
            }] : []],
            footer: {
                text: `Issued by ${this.bot.getTag(punisher)} | Use ${prefix}reason ${punishment.id} <reason> to edit the reason`,
                icon_url: punisher.avatarURL
            },
            color: PunishColors[punishment.type]
            
        };
    }
}
module.exports = ModLog;
