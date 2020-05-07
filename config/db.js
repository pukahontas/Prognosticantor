const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: false
});

// Perform a database query on the PostgresSQL
exports.query = async (query) => {
	const client = await pool.connect();
	try {
		return client.query(query);
	} catch (err) {
		console.error(err);
	} finally {
		client.release();
	}
}

// Return just the results of a query
exports.rows = async (query) => (await exports.query(query)).rows;

// Define some common transactions by name
exports.get = async (name, ...args) => {
	const handler = common[name];
	if (typeof handler === "string") {
		return exports.rows(handler);
	} else if (typeof handler === "function")
		return handler(...args);
	else
		throw new Error (`Named query: "${name}" does not exist`)
}

const common = {
	"users" : (code) => exports.rows(`SELECT userid, username, firstname, lastname, CONCAT(firstname, ' ', lastname) as fullname, ARRAY_AGG(description) as roles FROM users JOIN roles ON roles.roleid = ANY(users.roles) ${code ? `WHERE code = '${code}'` : '' } GROUP BY users.userid`),
	"users by role" : (roles, code) => exports.rows(`SELECT userid, username, firstname, lastname, CONCAT(firstname, ' ', lastname) as fullname FROM users WHERE users.roles && '{${[roles].flat()}}' ${code ? `AND code = '${code}'` : '' }`),
	"admins" : (code) => common['users by role'](0, code),
	"callers" : (code) => common['users by role'](1, code),
	"witnesses" : (code) => common['users by role'](2, code),
	"verifiers" : (code) => common['users by role'](3, code),
	"display calls" : `SELECT * FROM calls 
LEFT JOIN status
	ON calls.status = status.statusid 
LEFT JOIN (SELECT userid as witnessid, CONCAT(firstname, ' ', lastname) as witnessedby FROM users) as witness
	ON calls.witnessedBy = witness.witnessid
LEFT JOIN (SELECT userid as submitid, CONCAT(firstname, ' ', lastname) as submittedby FROM users) as submit
	ON calls.submittedby = submit.submitid
INNER JOIN (SELECT callid, max(update) as maxUpdate FROM calls GROUP BY callid) as x 
	ON calls.callid = x.callid
WHERE update = maxUpdate AND calls.status != 6
ORDER BY calldate DESC`,
	"all calls" : `SELECT * FROM calls 
LEFT JOIN status
	ON calls.status = status.statusid 
LEFT JOIN (SELECT userid as witnessid, CONCAT(firstname, ' ', lastname) as witnessedby FROM users) as witness
	ON calls.witnessedBy = witness.witnessid
LEFT JOIN (SELECT userid as submitid, CONCAT(firstname, ' ', lastname) as submittedby FROM users) as submit
	ON calls.submittedby = submit.submitid
INNER JOIN (SELECT callid, max(update) as maxUpdate FROM calls GROUP BY callid) as x 
	ON calls.callid = x.callid
WHERE update = maxUpdate
ORDER BY id ASC`,
	"all calls by status" : `SELECT * FROM calls 
LEFT JOIN status
	ON calls.status = status.statusid 
LEFT JOIN (SELECT userid as witnessid, CONCAT(firstname, ' ', lastname) as witnessedby FROM users) as witness
	ON calls.witnessedBy = witness.witnessid
LEFT JOIN (SELECT userid as submitid, CONCAT(firstname, ' ', lastname) as submittedby FROM users) as submit
	ON calls.submittedby = submit.submitid
INNER JOIN (SELECT callid, max(update) as maxUpdate FROM calls GROUP BY callid) as x 
	ON calls.callid = x.callid
WHERE update = maxUpdate
ORDER BY status.status DESC, calldate DESC`,
	"all updates" : `SELECT * FROM calls 
LEFT JOIN status
	ON calls.status = status.statusid 
LEFT JOIN (SELECT userid as witnessid, CONCAT(firstname, ' ', lastname) as witnessedby FROM users) as witness
	ON calls.witnessedBy = witness.witnessid
LEFT JOIN (SELECT userid as submitid, CONCAT(firstname, ' ', lastname) as submittedby FROM users) as submit
	ON calls.submittedby = submit.submitid
ORDER BY id ASC`
}