const axios = require('axios');
const { config } = global.ReneBot;
const { log, getText } = global.utils;
if (global.timeOutUptime != undefined)
	clearTimeout(global.timeOutUptime);
if (!config.autoUptime.enable)
	return;

const PORT = config.dashBoard?.port || (!isNaN(config.serverUptime.port) && config.serverUptime.port) || 3001;

let myUrl = config.autoUptime.url || `https://${process.env.REPL_OWNER
	? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
	: process.env.API_SERVER_EXTERNAL == "https://api.glitch.com"
		? `${process.env.PROJECT_DOMAIN}.glitch.me`
		: `localhost:${PORT}`}`;
myUrl.includes('localhost') && (myUrl = myUrl.replace('https', 'http'));
myUrl += '/uptime';

let status = 'ok';
setTimeout(async function autoUptime() {
	try {
		await axios.get(myUrl);
		if (status != 'ok') {
			status = 'ok';
			log.info("UPTIME", "Le bot est en ligne");
			// Custome notification here
		}
	}
	catch (e) {
		const err = e.response?.data || e;
		if (status != 'ok')
			return;
		status = 'failed';

		if (err.statusAccountBot == "chargement impossible") {
			log.err("UPTIME", "impossible de connecter au compte ");
			// Custome notification here
		}
		else if (err.statusAccountBot == "arrête spam") {
			log.err("UPTIME", "Votre compte est bloqué");
			// Custome notification here
		}
	}
	global.timeOutUptime = setInterval(autoUptime, config.autoUptime.timeInterval);
}, (config.autoUptime.timeInterval || 180) * 1000);
log.info("AUTO UPTIME", getText("autoUptime", "autoUptimeTurnedOn", myUrl));
