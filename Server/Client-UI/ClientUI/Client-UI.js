import { strictEqual } from 'assert';
import { createRequire } from 'module';
// na2alto 3al server.js
let id = -1
const require = createRequire(import.meta.url);
const express = require("express")
const mysql = require("mysql")
const app = express();
const path = require('path');
app.set('view engine', 'ejs')
const bodyParser = require('body-parser')
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'HadiAliAdam128!',
    database: 'thecarspadb' // Specify the database name
});


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/TheCarSpa/Login/Booking', async (req, res) => {
    const displayDiv = req.query.displayDiv === 'true'; // Check if query parameter exists and set displayDiv accordingly
    res.render('ClientUI', { displayDiv: true });
});

// Handle form submission
app.post('/TheCarSpa/Login/Booking/submit-testimonial', async function (req, res) {
    const testimonial = req.body.testimonial;
    console.log(testimonial);


    const res1 = await connection.query("SELECT MAX(`testimonial_id`) AS max_testimonial_id FROM pending_testimonials");
    await console.log(res1)
    const max_testimonial_id = await res1[0][0].max_testimonial_id;
    const clientname = "zabbeta ma3 wassim"
    const testimonial_id = max_testimonial_id + 1;
    var [res] = await connection.query(`INSERT INTO pending_testimonials (testimonialid, testimonial_content, client_name) VALUES (?, ?, ?)`, [testimonial_id, testimonial, clientname]);
    res.render('ClientUI')
    res.redirect('/TheCarSpa/Login/Booking/submit-testimonial?displayDiv=true');

});
app.get('/TheCarSpa/Login/Booking/view-previous-orders', async (req, res) => {

    let query = await connection.query("SELECT * from pending_testimonials", (err, rows) => {
        if (err) throw err;
        res.render('previous-orders', {
            title: 'Previous Orders',
            users: rows
        })
    })
})

app.post('/TheCarSpa/Login/Booking/confirm-testimonials', async (req, res) => {
    const { testimonial_id, client_name, testimonial_content } = req.body; // Get values from form submission

    try {

        await connection.query(
            `INSERT INTO testimonials (testimonial_id, clientname, testimonial_content) VALUES (?, ?, ?)`,
            [testimonial_id, client_name, testimonial_content]
        );

        await connection.query(
            `DELETE FROM pending_testimonials WHERE testimonial_id = ?`,
            [testimonial_id]
        );

        // Redirect or send a success response
        res.redirect('/TheCarSpa/Login/Booking/view-previous-orders'); // Redirect back to the previous-orders page or another route
    } catch (error) {
        console.error('Error adding entry to another table:', error);
        res.status(500).send('Error adding entry to another table');
    }
});

// Start the server
const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

