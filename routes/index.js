const dateFormat = require('dateformat');
const db = require(__basedir + '/config/db.js');

module.exports = async (req, res) => {
    try {
      const calls = await db.get('display calls');
      
      res.render('index', {calls, dateFormat} );
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
}