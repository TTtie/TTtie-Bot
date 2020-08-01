
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
const { SerializedArgumentParser, Eris: { GuildChannel, Constants: ErisConstants } } = require("sosamba");
const { PunishTypes } = require("../lib/modlog/constants");
const Command = require("../lib/commandTypes/ModCommand");

class LockCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "lock",
            description: "Locks a channel by restricting all users from posting in the channel",
            argParser: new SerializedArgumentParser(sosamba, {
                args: [{
                    name: "channel",
                    type: GuildChannel,
                    description: "the channel to lock",
                    textOnly: true,
                    default: ctx => ctx.channel
                }, {
                    name: "reason",
                    type: String,
                    rest: true,
                    description: "the reason for locking the channel",
                    default: SerializedArgumentParser.None
                }]
            })
        });
    }

    async run(ctx, [ channel, reason ]) {
        const basePermissions = channel.permissionOverwrites.get(ctx.guild.id);

        let { allow, deny } = basePermissions;
        
        allow &= ~ErisConstants.Permissions.sendMessages;
        deny |= ErisConstants.Permissions.sendMessages;

        if (channel.permissionsOf(ctx.author.id).has("sendMessages")) {
            await channel.createMessage({
                embed: {
                    title: "🔐 This channel has been locked",
                    description: reason || "No reason provided. Please contact the moderators for further information.",
                    color: 0xFF0000,
                    footer: {
                        text: `Locked by ${this.sosamba.getTag(ctx.author)}`,
                        icon_url: ctx.author.avatarURL
                    }
                }
            });
        }
        
        await channel.editPermission(ctx.guild.id, allow, deny, "role", encodeURIComponent(`${this.sosamba.getTag(ctx.author)}: ${reason}`));
        this.sosamba.modLog.createPunishment(ctx, PunishTypes.LOCK, undefined, reason).catch(() => void 0);
        await ctx.send(`:ok_hand: Locked ${channel.mention}`);
    }


}

module.exports = LockCommand;
