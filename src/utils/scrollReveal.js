export const scrollReveal = () => {

const sections=
document.querySelectorAll(".scroll-reveal");


const observer=
new IntersectionObserver(

(entries)=>{

entries.forEach((entry)=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},

{

threshold:0.1,
rootMargin:"0px 0px -40px 0px"

}

);


sections.forEach((section)=>{

observer.observe(section);

});


return ()=>{

sections.forEach((section)=>{

observer.unobserve(section);

});

}

}