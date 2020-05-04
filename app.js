const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')

const PORT = process.env.PORT || 5000

express()
	.use(express.static(path.join(__dirname, 'public')))
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({ extended: false }))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'pug')
	.get('/', require('./routes/index.js'))
	.get('/actions/:code', require('./routes/actions.js'))
	.post('/actions/:code', 
		[check('title').trim().escape(), check('calldate').toDate(), check('expiry').toDate(), check('description').trim().escape()], 
		require('./routes/submit.js')
	)
	.post('/actions', (req, res) => 
		req.body.pw ? res.redirect('/actions/' + req.body.pw) : res.render('login')
	)
	.get('/actions', (req, res) => res.render('login'))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`))
  
  
