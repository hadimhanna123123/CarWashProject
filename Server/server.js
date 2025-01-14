/*import    {testimonialreplies,names} from './utils/client-runner.js'*/

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");



function initializePassport(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (ClientEmail, ClientPassword, done) => {
        const user = await getUserByEmail(ClientEmail);

        if (!user) {
            return done(null, false, { message: 'No user with that email' });
        }
        console.log(ClientPassword)
        console.log(user.ClientPassword)
        const passmatch = await bcrypt.compare(ClientPassword, user.ClientPassword)
        try {
            if (passmatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    // Serialize user to store in the session
    passport.serializeUser((user, done) => done(null, user.ClientId));

    // Deserialize user to fetch from the session
    passport.deserializeUser(async (ClientId, done) => {
        const user = await getUserById(ClientId);

        if (!user) {
            return done(null, false, { message: 'No user with that id' });
        }

        return done(null, user);
    });
}

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);



const express = require("express")
const mysql = require("mysql2/promise")
const app = express();

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '.....',
    database: 'cleaningservicemanagementsystem' // Specify the database name
});

app.set('view engine', 'ejs')
const bodyParser = require('body-parser');
const port = 5500;

function getRandomInt(max) {
    return 1 + Math.floor(Math.random() * max);
}
initializePassport(
    passport,
    async email => {
        const [rows] = await connection.execute('SELECT * FROM client WHERE ClientEmail = ?', [email]);
        return rows[0];
    },
    async id => {
        const [rows] = await connection.execute('SELECT * FROM client WHERE ClientId = ?', [id]);
        return rows[0];
    }
);
app.use(express.static(path.join(__dirname, "views/img")));


app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

var servicename = await connection.query("select serviceTypeId,ServiceTypeName from ServiceType")
console.log(servicename[0])
const servicesMap = servicename[0].reduce((map, service) => {
    map.set(service.serviceTypeId, service.ServiceTypeName);
    return map;
}, new Map());
console.log(servicesMap)

app.post("/TheCarSpa/Login", checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: "/TheCarSpa/Login/Booking",
    failureRedirect: "/TheCarSpa/login",
    failureFlash: true
}));

app.get("/TheCarSpa/Login/Booking", checkAuthenticated, (req, res) => {
    res.render("ClientUI.ejs", { name: req.user.ClientName });
});

app.get('/TheCarSpa/Login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.get('/TheCarSpa/Register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs");
});

// server.js

// ... (your existing code)

app.delete("/logout", (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect("TheCarSpa");
    });
});



app.post("/TheCarSpa/Login/Register", checkNotAuthenticated, async (req, res) => {

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const sql = "INSERT INTO client (ClientName,ClientPhone, ClientEmail, ClientPassword) VALUES (?,?,?,?)";
    //console.log(req.body.name, req.body.email, hashedPassword)
    const values = [req.body.name, req.body.phone, req.body.email, hashedPassword];

    // Check if any of the values is undefined


    const [data] = await connection.execute(sql, values);

    res.redirect('/TheCarSpa/Login')
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/TheCarSpa/Login/Booking");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/TheCarSpa/Login");
    }
    next();
}



app.get("/TheCarSpa/ClientTestimonials", async (req, resp) => {
    var testimonialreplies = [];
    var names = [];
    /* var res = await connection.query("SELECT MAX(`testimonial_id`) AS max_testimonial_id FROM testimonials");
     var max_testimonial_id = await res[0][0].max_testimonial_id;
 
     var test1num = -1;
     var test2num =-1;
     var test3num = -1;
     do {
         test1num = getRandomInt(max_testimonial_id);
         test2num = getRandomInt(max_testimonial_id);
         test3num = getRandomInt(max_testimonial_id);
     } while ((test1num === test2num || test1num === test3num || test2num === test3num));
     
     console.log(test1num,test2num,test3num)
 
     async function query(testnum) {
         var res = await connection.query(`SELECT client_name, testimonial_content FROM testimonials WHERE testimonial_id = '${testnum}'`);
       //  console.log(res);
         const data= await res[0];
 
         const name = await data[0].client_name;
         const content = await data[0].testimonial_content;
         testimonials.push({name, content});
     //    console.log(testimonials)
 
     }
 
     await query(test1num);
     
     await query(test2num);
     await query(test3num);
 
 
      names =  testimonials.map(testimonial => testimonial.name);*/



    var res = await connection.query("  SELECT Testimonial.TestimonialReview, Client.ClientName FROM Testimonial Natural JOIN Client WHERE StatusId = 2 ORDER BY RAND() LIMIT 3")
    res = res[0];

    for (let i = 0; i < 3; i++) {
        names[i] = res[i].ClientName;
        testimonialreplies[i] = res[i].TestimonialReview
    }
    console.log(names)
    console.log(testimonialreplies)
    resp.render("Client-Testimonials.ejs", {
        testimonialreplies,
        names
    })
});


app.get("/TheCarSpa/Home", (req, res) => {

    res.render("home.ejs")

});


app.get("/TheCarSpa/About", (req, res) => {

    res.render("about.ejs")
});

app.get("/TheCarSpa/Pricing", (req, res) => {

    res.render("Pricing")
});
const user =
{
    ClientId: 7,
    ClientName: 'Hadi Mhanna',
    ClientPhone: '76626322',
    ClientEmail: 'hm@lau.edu',
    ClientPassword: '$2b$10$N3fsyGEJiKIJuTr8wRdv7ey/zWmQZHGS5De3bADGFNAwBKiEBIPVy',
    ClientImage: null,
    ClientAddress: 'Beirut'
}


app.use(bodyParser.urlencoded({ extended: true }));

// Handle form submission
app.post('/TheCarSpa/Login/Booking/submit-testimonial', async function (req, res) {
    const testimonial = req.body.testimonial;
    console.log(testimonial);

    await connection.query(`INSERT INTO testimonial (TestimonialReview, ClientId,StatusId,CreatedDate) VALUES (?, ?,?,CURRENT_DATE())`, [testimonial, user.ClientId, 1]);
    res.render('success')

});

app.get('/TheCarSpa/Login/Booking/view-previous-orders', async (req, res) => {

    const ClientId = req.user.ClientId
    console.log(ClientId)
    var rows = await connection.query("select ServiceTypeName,CarDetail,BookingDate,ClientAddress from booking natural join servicetype where ClientId=?", [ClientId]);
    rows = rows[0]
    console.log(rows)

    res.render('previous-orders', {
        title: 'PREVIOUS ORDERS',
        users: rows
    });

})

app.get('/TheCarSpa/Login/Booking/checkout', async (req, res) => {

    var carbrandd = await connection.query("select CarDetail from clientCar where ClientId=?", [user.ClientId])
    console.log(carbrandd = carbrandd[0][0].CarDetail)
    res.render('index.ejs', {
        user,
        carbrandd
    });
});

app.use(express.urlencoded({ extended: true }));

app.post('/TheCarSpa/Login/Booking/checkout/submit', async (req, res) => {

    const { carbrand, phonenum, address, service } = req.body;
    console.log(req.body)
    console.log(carbrand, phonenum, address, service)
    var servicetypeIdd = await connection.execute('select ServiceTypeId from servicetype where servicetypename=?', [service])
    servicetypeIdd = servicetypeIdd[0][0].ServiceTypeId;
    console.log(servicetypeIdd)
    try {
        await connection.query('INSERT INTO Booking ( BookingDate, ServiceTypeId, ClientId, CarDetail, ClientAddress, StatusId, ClientPhone) VALUES (CURRENT_DATE(), ?, ?, ?, ?, 1,?)', [servicetypeIdd, user.ClientId, carbrand, address, phonenum]);
        // 1 means unconfirmed 2 means confirmed
        res.redirect('/TheCarSpa/Login/Booking/checkout/submit/accept');
    } catch (error) {
        console.error('Error inserting into database:', error);
        res.status(500).send('Error processing request');
    }
});

app.get('/TheCarSpa/Login/Booking/checkout/submit/accept', async (req, res) => {
    res.render('accept.ejs')
});


app.get('/TheCarSpa/Login/Manager', async (req, res) => {
    res.render('Manager.ejs')


});


app.post('/TheCarSpa/Login/Manager/confirm-testimonials', async (req, resp) => {
    const { TestimonialId, ClientName, TestimonialReview } = req.body; // Get values from form submission
    /*  var res = await connection.query("SELECT MAX(`testimonial_id`) AS max_testimonial_id FROM testimonials");
      var max_testimonial_id = await res[0][0].max_testimonial_id;    
      console.log(max_testimonial_id)
      try {
  
          await connection.query(
              `INSERT INTO testimonials (testimonial_id, client_name, testimonial_content) VALUES (?, ?, ?)`,
              [max_testimonial_id+1, client_name, testimonial_content]
          );
  
          await connection.query(
              `DELETE FROM pending_testimonials WHERE testimonial_id = ?`,
              [testimonial_id]
          );*/


    try {

        await connection.query("update testimonial set StatusId=2 where TestimonialId=?", [TestimonialId])

        resp.redirect('/TheCarSpa/Login/Manager/view-pending-testimonials'); // Redirect back to the previous-orders page or another route}
    } catch (error) {
        console.error('Error in query:', error);
    }
});


app.get('/TheCarSpa/Login/Manager/view-pending-testimonials', async (req, res) => {
    try {
        const [rows] = await connection.execute("select ClientName,TestimonialId,CreatedDate,TestimonialReview from testimonial natural join client where statusId=1");
        res.render('pending-testimonials', {
            title: 'PENDING TESTIMONIALS',
            users: rows
        });
    } catch (error) {
        console.error('Error fetching pending testimonials:', error);
        res.status(500).send('Error fetching pending testimonials');
    }
})


app.get('/TheCarSpa/Login/Manager/view-pending-orders', async (req, res) => {

    /*  let query = await connection.query("SELECT * from pendingbookings", (err, rows) => {
          if (err) throw err;
          res.render('pending-orders', {
              title: 'PENDING TESTIMONIALS',
              users: rows
          })
     })*/
    /*   try {
           const [rows] = await connection.execute("SELECT * FROM pendingbookings");
           res.render('pending-orders', {
               title: 'PENDING TESTIMONIALS',
               users: rows
           });*/


    try {
        const [rows] = await connection.execute("SELECT  * FROM booking b ,client c,  servicetype s where c.Clientid=B.ClientId and s.ServiceTypeId=b.Servicetypeid and statusId=1");
        res.render('pending-orders', {
            title: 'PENDING TESTIMONIALS',
            users: rows
        })

    } catch (error) {
        console.error('Error fetching pending bookings:', error);
        res.status(500).send('Error fetching pending bookings');
    }
})

app.post('/TheCarSpa/Login/Manager/view-pending-orders/contactClient', async (req, res) => {
    /*const { booking_id, client_id, client_address, car_brand, car_make, phone_number, booking_date, service_type } = req.body; // Get values from form submission
    var [client_name] = await connection.query(`select name from clients where id=12`, [client_id]);
    const client_name1 = client_name[0].name
    console.log(client_name1)
    const whatsapp_link = "https://wa.me/" + phone_number;*/
    const{BookingId,ClientPhone,ClientId}=req.body;
    console.log(BookingId,ClientPhone,ClientId)
    //var [client_name] = await connection.query(`select name from clients where id=12`, [client_id]);

    //res.render('contact-client.ejs', { whatsapp_link, client_name1 }); // Redirect back to the previous-orders page or another route



});
app.get('/TheCarSpa/Login/Manager/SetAvailability', async (req, res) => {

    var [rows] = await connection.execute("SELECT * FROM TEAM");

    res.render('TeamAvailability', {
        title: 'PENDING TESTIMONIALS',
        users: rows
    })

});


app.post('/TheCarSpa/Login/Manager/SetAvailability/Change', async (req, resp) => {
    const { TeamId, availability } = req.body; // Get values from form submission
    if (availability == 'T') {
        await connection.query(`UPDATE team SET availability="F" WHERE teamID = ?`, [TeamId])
    }
    else {
        await connection.query(`UPDATE team SET availability="T" WHERE teamID = ?`, [TeamId])
    }

    resp.redirect('/TheCarSpa/Login/Manager/SetAvailability'); // Redirect back to the previous-orders page or another route
});

app.listen(port, () => {
    console.log('running ya Hadi ' + port);
});


