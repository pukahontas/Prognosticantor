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
		LEFT JOIN (SELECT id as statusid, status as status FROM status) as status
			ON calls.status = status.statusid 
		LEFT JOIN (SELECT id as witnessid, CONCAT(firstname, ' ', lastname) as witnessedby FROM users) as witness
			ON calls.witnessedBy = witness.witnessid 
		ORDER BY timestamp DESC`;
      const result = await client.query(q);
      const results = { 'calls': (result) ? result.rows : null};
	  console.log(results);
      res.render('index', {results, dateFormat} );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
}