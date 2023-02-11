document.querySelector('.theme').addEventListener('click', (event) => {
    event.preventDefault();
    if(localStorage.getItem('theme') === 'dark'){
        localStorage.removeItem('theme')
    } else {
        localStorage.setItem('theme', 'dark')
    }
    addThemeClass();
})

function addThemeClass(){
    try {
        if (localStorage.getItem('theme') === 'dark'){
            document.querySelector('html').classList.add('dark');
            document.querySelector(".theme img").src="assets/images/sun.svg"
        } else {
            document.querySelector('html').classList.remove('dark');
            document.querySelector(".theme img").src="assets/images/moon.svg"
        }
    } catch (err) {}
}
