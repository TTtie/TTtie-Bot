"use strict";!function(e){function t(e,t){return l=>{l.innerHTML="",l.disabled=!1;const o=document.createElement("option");o.value="",o.innerText="None",o.selected=!0,l.appendChild(o),t.forEach(t=>{const o=document.createElement("option");o.value=t.id,o.innerText=(e?"#":"")+t.name,l.appendChild(o)})}}function l(e){const t=document.querySelector("#tttie-dash-p").value;let l;for(const e of document.querySelectorAll("select.tttie-dashboard-role-picker#tttie-dash-mod option"))!0===e.selected&&(l=e.value);const o=document.querySelector("#tttie-dash-fm").value,n=document.querySelector("#tttie-dash-le").value;let r;for(const e of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-fc option"))!0===e.selected&&(r=e.value);const a=document.querySelector("#tttie-dash-wm").value;let c,s,d,i,u,m;for(const e of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-wc option"))!0===e.selected&&(c=e.value);for(const e of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-ac option"))!0===e.selected&&(s=e.value);for(const e of document.querySelectorAll("select.tttie-dashboard-role-picker#tttie-dash-mr option"))!0===e.selected&&(d=e.value);for(const e of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-loc option"))!0===e.selected&&(i=e.value);for(const e of document.querySelectorAll("select.tttie-dashboard-channel-picker#tttie-dash-ml option"))!0===e.selected&&(u=e.value);for(const e of document.querySelectorAll("select#tttie-dash-locale option"))!0===e.selected&&(m=e.value);e({prefix:t,modRole:l,farewellMessage:o,farewellChannelId:r,greetingMessage:a,greetingChannelId:c,agreeChannel:s,memberRole:d,logEvents:n,logChannel:i,modlogChannel:u,locale:m})}function o(e){const t=document.querySelector("#tttie-dash-p"),l=document.querySelector("#tttie-dash-fm"),o=document.querySelector("#tttie-dash-mod"),n=document.querySelector("#tttie-dash-wm"),r=document.querySelector("#tttie-dash-le"),a=document.querySelector("#tttie-dash-ml"),c=document.querySelector("#tttie-dash-ac"),s=document.querySelector("#tttie-dash-wc"),d=document.querySelector("#tttie-dash-fc"),i=document.querySelector("#tttie-dash-mr"),u=document.querySelector("#tttie-dash-loc"),m=document.querySelector("#tttie-dash-locale");t.value=e.prefix||"",l.value=e.farewellMessage||"",n.value=e.greetingMessage||"",r.value=e.logEvents||"";for(const t of d.querySelectorAll("option"))if(t.value===e.farewellChannelId){t.selected=!0;break}for(const t of s.querySelectorAll("option"))if(t.value===e.greetingChannelId){t.selected=!0;break}for(const t of c.querySelectorAll("option"))if(t.value===e.agreeChannel){t.selected=!0;break}for(const t of u.querySelectorAll("option"))if(t.value===e.logChannel){t.selected=!0;break}for(const t of i.querySelectorAll("option"))if(t.value===e.memberRole){t.selected=!0;break}for(const t of o.querySelectorAll("option"))if(t.value===e.modRole){t.selected=!0;break}for(const t of a.querySelectorAll("option"))if(t.value===e.modlogChannel){t.selected=!0;break}for(const t of m.querySelectorAll("option"))if(t.value===e.locale){t.selected=!0;break}t.parentElement.classList.remove("is-loading"),t.disabled=!1,o.parentElement.classList.remove("is-loading"),o.disabled=!1,a.parentElement.classList.remove("is-loading"),a.disabled=!1,l.parentElement.classList.remove("is-loading"),l.disabled=!1,n.parentElement.classList.remove("is-loading"),n.disabled=!1,c.parentElement.classList.remove("is-loading"),c.disabled=!1,s.parentElement.classList.remove("is-loading"),s.disabled=!1,d.parentElement.classList.remove("is-loading"),d.disabled=!1,r.parentElement.classList.remove("is-loading"),r.disabled=!1,u.parentElement.classList.remove("is-loading"),u.disabled=!1,i.parentElement.classList.remove("is-loading"),i.disabled=!1,m.parentElement.classList.remove("is-loading"),m.disabled=!1}window.addEventListener("load",()=>{const n=document.querySelectorAll("select.tttie-dashboard-channel-picker"),r=document.querySelectorAll("select.tttie-dashboard-role-picker:not(.no-role-hierarchy)"),a=document.querySelectorAll("select.tttie-dashboard-role-picker.no-role-hierarchy");e.ttbot.bindToSaveButton(document.querySelector("button#save"),o,l),e.ttbot.bindToResetButton(document.querySelector("button#reset"),o),e.ttbot.getAvailableChannels().then(l=>(n.forEach(t(!0,l)),e.ttbot.getAvailableRoles())).then(l=>(r.forEach(t(!1,l.filter(t=>t.id!==e.ttbot.guildId))),e.ttbot.getAvailableRoles(!0))).then(l=>{a.forEach(t(!1,l.filter(t=>t.id!==e.ttbot.guildId)))}).then(()=>{e.ttbot.getConfig().then(o)})})}(window);