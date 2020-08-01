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
const PunishTypes = {
    STRIKE:         0,
    KICK:           1,
    SOFTBAN:        2,
    BAN:            3,
    STRIKE_REMOVE:  4,
    REMOVED_STRIKE: 5,
    LOCK:           6,
    UNLOCK:         7
};

const makeTableFromPunishTypes = map => {
    const out = {};
    for (const k in PunishTypes) {
        if (!Object.prototype.hasOwnProperty.call(PunishTypes, k)) continue;
        out[k] = map[k];
        out[PunishTypes[k]] = map[k];
    }

    return out;
};

const Constants = {
    PunishTypes,
    PunishColors: makeTableFromPunishTypes({
        STRIKE:         0xebef0b,
        KICK:           0xefb20a,
        SOFTBAN:        0xef840a,
        BAN:            0xcc1010,
        STRIKE_REMOVE:  0x3acc0e,
        REMOVED_STRIKE: 0x3acc0e,
        LOCK:           0xefb20a,
        UNLOCK:         0x3acc0e
    }),
    PunishTexts: makeTableFromPunishTypes({
        STRIKE:         "Strike",
        KICK:           "Kick",
        SOFTBAN:        "Softban",
        BAN:            "Ban",
        STRIKE_REMOVE:  "Strike removal",
        REMOVED_STRIKE: "Removed strike",
        LOCK:           "Channel lock",
        UNLOCK:         "Channel unlock"
    })
};
module.exports = Constants;
