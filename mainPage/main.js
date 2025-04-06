document.getElementById('learn-more').addEventListener('click', scrollToElement);

function scrollToElement() {
    element = document.getElementById('second-center-line');
    element.scrollIntoView({behavior: "smooth"});
}