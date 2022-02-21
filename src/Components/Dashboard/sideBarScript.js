window.addEventListener('DOMContentLoaded', event => {
    // Toggle the side navigation
    console.log("set up")
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    console.log(sidebarToggle)

        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    

});