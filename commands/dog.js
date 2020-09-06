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
const { Command } = require("sosamba");
const { get } = require("chainfetch");

class DogCommand extends Command {
    constructor(...args) {
        super(...args, {
            name: "dog",
            description: "Gets a random dog picture.",
            aliases: ["woof"]
        });
    }

    async run(ctx) {
        const { body } = await get("https://random.dog/woof.json?filter=mp4,webm").toJSON();

        ctx.send({
            embed: {
                image: {
                    url: body.url
                },
                color: 0x008800
            }
        });
    }
}

module.exports = DogCommand;
