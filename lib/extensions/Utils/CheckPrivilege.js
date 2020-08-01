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
const { ExtensionFlags } = require("@tt-bot-dev/extension-runner/Constants");
module.exports = (extension, privilege, error = true) => {
    if (!Object.prototype.hasOwnProperty.call(ExtensionFlags, privilege)) return error ? undefined : true;
    if (extension.flags & ExtensionFlags[privilege]) return error ? undefined : true;
    if (error) throw new Error(`Missing permissions to run this action. Please enable the "${privilege}" flag or remove conflicting code.`);
};
