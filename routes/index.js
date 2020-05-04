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
	  const q = 
		`SELECT * FROM calls 
LEFT JOIN status
	ON calls.status = status.statusid 
LEFT JOIN (SELECT userid as witnessid, CONCAT(firstname, ' ', lastname) as witnessedby FROM users) as witness
	ON calls.witnessedBy = witness.witnessid
LEFT JOIN (SELECT userid as submitid, CONCAT(firstname, ' ', lastname) as submittedby FROM users) as submit
	ON calls.submittedby = submit.submitid
INNER JOIN (SELECT callid, max(update) as maxUpdate FROM calls GROUP BY callid) as x 
	ON calls.callid = x.callid WHERE update = maxUpdate
ORDER BY calls.callid = 6 DESC, calldate DESC`;
      const result = await client.query(q);
      const results = { 'calls': (result) ? result.rows : null};
	  //console.log(results);
      res.render('index', {results, dateFormat} );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
}