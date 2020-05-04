const dateFormat = require('dateformat');
const { Pool } = require('pg');
const pool = new Pool({
	user: 'postgres',
	connectionString: process.env.DATABASE_URL,
	ssl: false
});

module.exports = async (req, res) => {
	try {
		const client = await pool.connect();

		const code = req.params.code;
		if (! /^[a-zA-Z0-9]{6,}$/.test(code))
			throw new error("Password in invalid format")

		const users = await client.query(`SELECT * FROM users WHERE code = '${code}'`);
		const roles = await client.query("SELECT * FROM roles");
		
		if (!users.rows || users.rows.length != 1)
			throw new error ("Error looking up user")
		
		// Get the unwitnessed
		//await client.query(`SELECT * FROM calls WHERE ISNULL(witnessedby) GROUP BY callid`);
		
		res.render('actions', {user: users.rows[0], roles:roles.rows} );
		client.release();
	} catch (err) {
		console.error(err);
		res.render('login', { error : true });
	}
}