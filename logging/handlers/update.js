module.exports = async function (config, msg, old) {
    
    if (!msg.guild.channels.has(config.logChannel)) return;
    try {
        await msg.channel.guild.channels.get(config.logChannel).createMessage({
            embed: {
                author: {
                    name: `${bot.getTag(msg.author)} (${msg.author.id})`,
                    icon_url: msg.author.avatarURL
                },
                title: "Message updated",
                fields: [{
                    name: "ID",
                    value: msg.id,
                    inline: true
                },
                {
                    name: "Channel",
                    value: msg.channel.mention,
                    inline: true
                },
                {
                    name: "Old content",
                    value: old.content.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
                }, {
                    name: "New content",
                    value: msg.content.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
                }
                ],
                color: 0xFFFF00
            }
        });
    } catch (_) {
        return;
    }
};