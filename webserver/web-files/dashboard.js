"use strict";

(function (win) {

    function loadPickers(isChannel, channel) {
        return element => {
            element.innerHTML = ""; // clear out lazy loading
            element.disabled = false;
            const noneSel = document.createElement("option");
            noneSel.value = "";
            noneSel.innerText = "None";
            noneSel.selected = true;
            element.appendChild(noneSel);
            channel.forEach(chan => {
                const select = document.createElement("option");
                select.value = chan.id;
                select.innerText = (isChannel ? "#" : "") + chan.name;
                element.appendChild(select);
            });
        };
    }
    function dataCollector(cb) {
        const prefix = document.querySelector("#tttie-dash-p").value;
        let modRole;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-role-picker#tttie-dash-mod option")) if (opt.selected === true) modRole = opt.value;
        const farewellMessage = document.querySelector("#tttie-dash-fm").value;
        const logEvents = document.querySelector("#tttie-dash-le").value;
        let farewellChannelId;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-fc option")) if (opt.selected === true) farewellChannelId = opt.value;
        const greetingMessage = document.querySelector("#tttie-dash-wm").value;
        let greetingChannelId;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-wc option")) if (opt.selected === true) greetingChannelId = opt.value;
        let agreeChannel;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-ac option")) if (opt.selected === true) agreeChannel = opt.value;
        let memberRole;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-role-picker#tttie-dash-mr option")) if (opt.selected === true) memberRole = opt.value;
        let logChannel;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-loc option")) if (opt.selected === true) logChannel = opt.value;
        let modlogChannel;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-ml option")) if (opt.selected === true) modlogChannel = opt.value;
        cb({
            prefix,
            modRole,
            farewellMessage,
            farewellChannelId,
            greetingMessage,
            greetingChannelId,
            agreeChannel,
            memberRole,
            logEvents,
            logChannel,
            modlogChannel
        });
    }
    function setValues(cfg) {
        const inputP = document.querySelector("#tttie-dash-p");
        const inputMod = document.querySelector("#tttie-dash-mod");
        const inputFm = document.querySelector("#tttie-dash-fm");
        const inputWm = document.querySelector("#tttie-dash-wm");
        const inputLe = document.querySelector("#tttie-dash-le");
        inputP.value = cfg.prefix || "";
        inputMod.value = cfg.modRole || "";
        inputFm.value = cfg.farewellMessage || "";
        inputWm.value = cfg.greetingMessage || "";
        inputLe.value = cfg.logEvents || "";
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-fc option")) if (opt.value === cfg.farewellChannelId) opt.selected = true;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-wc option")) if (opt.value === cfg.greetingChannelId) opt.selected = true;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-ac option")) if (opt.value === cfg.agreeChannel) opt.selected = true;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-loc option")) if (opt.value === cfg.logChannel) opt.selected = true;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-role-picker#tttie-dash-mr option")) if (opt.value === cfg.memberRole) opt.selected = true;
        for (const opt of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-ml option")) if (opt.value === cfg.modlogChannel) opt.selected = true;
        inputP.disabled = false;
        inputMod.disabled = false;
        inputFm.disabled = false;
        inputWm.disabled = false;
        inputLe.disabled = false;
    }

    window.addEventListener("load", () => {
        const pickers = document.querySelectorAll("select.tttie-dashboard-channel-picker");
        const rPickers = document.querySelectorAll("select.tttie-dashboard-role-picker");
        win.ttbot.bindToSaveButton(document.querySelector("a.tttie-linkbutton#save"), setValues, dataCollector);
        win.ttbot.bindToResetButton(document.querySelector("a.tttie-linkbutton#reset"), setValues);
        win.ttbot.getAvailableChannels().then(c => {
            pickers.forEach(loadPickers(true, c));
            return win.ttbot.getAvailableRoles();
        }).then(r => {
            rPickers.forEach(loadPickers(false, 
                r.filter(r => r.id !== win.ttbot.guildId)
            ));
        }).then(() => {
            win.ttbot.getConfig().then(setValues);
        });
    });
})(window);