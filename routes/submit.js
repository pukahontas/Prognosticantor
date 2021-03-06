const {check, validationResult} = require('express-validator')
const db = require(__basedir + '/config/db.js');
const email = require(__basedir + '/config/email.js');

module.exports = async (req, res) => {
	try {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			throw new Error("Input validation error:", validationErrors.array());
		}
		
		const code = req.params.code;
		if (! /^[a-zA-Z0-9]{6,}$/.test(code))
			throw new error("Password in invalid format")

		const users = await db.get('callers', code);
		
		if (users.length != 1)
			throw new error ("Error looking up user or user does not have caller privileges: " + code)
		
		const user = users[0];
		
		const title = req.body.title;
		const calldate = req.body.calldate || (new Date());
		const expiry = req.body.expiry;
		const desc = req.body.description;
		
		const query = {
			text: "INSERT INTO calls (title, calldate, expirydate, description, submittedby, update, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING callid",
			values: [title, calldate, expiry, desc, user.userid, 0, 0],
		}
		const result = await db.query(query);

		res.sendStatus(200);

		email.newCall(result.rows[0].callid)
	} catch (err) {
		console.error(err);
		res.render('actions', { error : true });
	}
}

function strNull (obj) {
	if (obj === null)
		return 'NULL'
	
	let str;
	if (typeof obj == "string")
		str = obj
	else if (obj.toISOString)
		str = obj.toISOString();
	else
		str = obj.toString();
	
	return str ? `'${str}'` : 'NULL';
}