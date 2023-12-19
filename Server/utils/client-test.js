import mysql from 'mysql2/promise';


const connection = await mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'HadiAliAdam128!',
	database: 'thecarspadb' // Specify the database name
});


function getRandomInt(max) {
	return 1 + Math.floor(Math.random() * max);
}


export async function getRandomTestimonials() {

	var testimonials = [];

	var [res] = await connection.execute("SELECT MAX(`testimonial_id`) AS max_testimonial_id FROM testimonials");
	var max_testimonial_id = res[0].max_testimonial_id;

	function splitTestimonials(result) {
		const name = result[0].clientname;
		const content = result[0].testimonial_content;
		testimonials.push({ name, content });
	}

	let noteq = false;
	var test1num = getRandomInt(max_testimonial_id);
	var test2num = getRandomInt(max_testimonial_id);
	var test3num = getRandomInt(max_testimonial_id);



	do {
		test1num = getRandomInt(max_testimonial_id);
		test2num = getRandomInt(max_testimonial_id);
		test3num = getRandomInt(max_testimonial_id);
		if (test1num == test2num || test1num == test3num || test2num == test3num) {
			noteq = true;
		}
		else {
			noteq = false;
		}
	}
	while (noteq)



	async function query(testnum) {
		var [res] = await connection.execute(`SELECT  clientname, testimonial_content FROM testimonials WHERE testimonial_id = '${testnum}'`);
		splitTestimonials(res);
	}

	await query(test1num);
	await query(test2num);
	await query(test3num);


	return testimonials;
};


