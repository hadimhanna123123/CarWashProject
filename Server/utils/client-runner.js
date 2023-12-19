import { getRandomTestimonials } from "./client-test.js";

let testimonials = await getRandomTestimonials()
let names = testimonials.map(testimonial => testimonial.name)
let testimonialreplies = testimonials.map(testimonial => testimonial.content);
console.log(testimonialreplies)
console.log(names)
setInterval(refreshtestimonies, 1000);
export {
    testimonialreplies,names
}

async function refreshtestimonies(){
    testimonials = await getRandomTestimonials()
     names = testimonials.map(testimonial => testimonial.name)
     testimonialreplies = testimonials.map(testimonial => testimonial.content);
}