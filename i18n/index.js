class I18N {
    constructor(bot) {
        this.bot = bot;
        this.languages = {};


        const files = fs.readdirSync(`${__dirname}/../languages`);
        files.forEach(e => {
            if (/.+\.js$/.test(e)) {
                const translation = require(`${__dirname}/../languages/${e}`);
                this.languages[e.replace(/\.js$/, "")] = translation;
            }
        });
    }

    getTranslation(term, lang, ...args) {
        if (!this.languages[lang]) throw new Error("Unknown language");
        const tr = this.languages[lang][term] || this.languages["en"][term];
        if (!tr) return "Unknown term";
        if (typeof tr === "string") return tr;
        return tr(...args);
    }

    reloadLang(lang) {
        if (!this.languages[lang]) throw new Error("Unknown language");
        delete require.cache[require.resolve(`${__dirname}/../languages/${lang}.js`)]
        this.languages[lang] = require(`${__dirname}/../languages/${lang}.js`);
    }
}

module.exports = I18N;