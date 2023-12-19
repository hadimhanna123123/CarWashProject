import mysql from 'mysql2/promise';
import { createRequire } from 'module';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require=createRequire(import.meta.url);
const express= require("express")
const app = express();
const path= require('path');
app.use(express.static(path.join(__dirname)));
const bodyParser = require('body-parser');

// copied to file


const connection = await mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'HadiAliAdam128!',
	database: 'thecarspadb' // Specify the database name
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/TheCarSpa/Login/Booking/checkout', (req, res) => {
	res.render('index.ejs');
});

app.use(express.urlencoded({extended:true}));

app.post('/TheCarSpa/Login/Booking/checkout/submit', async (req, res) => {
	const clientid = 11124;
	const { carbrand, carmake, phonenum, address, Date, service } = req.body;
console.log(carbrand, carmake, phonenum, address, Date, service)
	try {
		await connection.query(
		`INSERT INTO pendingBookings (client_id, client_address, car_brand, car_make, phone_number, booking_date, service_type)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		[clientid, address, carbrand, carmake, phonenum, Date, service]
	  );

	  res.redirect('/TheCarSpa/Login/Booking/checkout/submit/accept');
	} catch (error) {
	  console.error('Error inserting into database:', error);
	  res.status(500).send('Error processing request');
	}
  });

  app.get('/TheCarSpa/Login/Booking/checkout/submit/accept', async (req, res) => {
res.render('accept.ejs')
  });
const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});