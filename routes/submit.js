const {check, validationResult} = require('express-validator')
const { Pool } = require('pg');
const pool = new Pool({
	user: 'postgres',
	connectionString: process.env.DATABASE_URL,
	ssl: false
});

module.exports = async (req, res) => {
	try {
		const client = await pool.connect();

		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			throw new Error("Input validation error:", validationErrors.array());
		}
		
		const code = req.params.code;
		if (! /^[a-zA-Z0-9]{6,}$/.test(code))
			throw new error("Password in invalid format")

		const users = await client.query(`SELECT * FROM users WHERE code = '${code}'`);
		
		if (!users.rows || users.rows.length != 1)
			throw new error ("Error looking up user")
		const user = users.rows[0];
		console.log(user)
		if (!user.roles.includes(0) && !user.roles.includes(1))
			throw new error ('User does not have caller priviledges')
		
		const title = req.body.title;
		const calldate = req.body.calldate || (new Date());
		const expiry = req.body.expiry;
		const desc = req.body.description;
		
		const query = "INSERT INTO calls (title, calldate, expirydate, description, submittedby, update, status) VALUES ("+[title, calldate, expiry, desc].map(strNull).join(', ') + ', ' + user.userid + ", 0, 0)";
		console.log(query);
		const result = await client.query(query);
		
		res.sendStatus(200);
		client.release();
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