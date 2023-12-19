import { getRandomTestimonials } from "./client-test.js";

const testimonials = await getRandomTestimonials();
const names = testimonials.map(testimonial => testimonial.name);
const testimonialreplies = testimonials.map(testimonial => testimonial.content);
console.log(testimonialreplies)
export {
    testimonials,names
}