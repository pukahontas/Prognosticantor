const dateFormat = require('dateformat');
const db = require(__basedir + '/config/db.js');

module.exports = async (req, res) => {
	try {
		const code = req.params.code;
		if (! /^[a-zA-Z0-9]{6,}$/.test(code))
			throw new error("Password in invalid format")

		const users = await db.get("users", code)
		
		if (!users || users.length != 1)
			throw new error ("Error looking up user")
		
		// Get the unwitnessed
		//await client.query(`SELECT * FROM calls WHERE ISNULL(witnessedby) GROUP BY callid`);
		
		res.render('actions', {user: users[0]} );
	} catch (err) {
		console.error(err);
		res.render('login', { error : true });
	}
}