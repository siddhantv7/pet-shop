document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const petName = urlParams.get('petName');
    const petBreed = urlParams.get('petBreed');
    const petAge = urlParams.get('petAge');
    const petLocation = urlParams.get('petLocation');

    // Now you can use these variables to display the data on the about page
    console.log("Pet Name:", petName);
    console.log("Pet Breed:", petBreed);
    console.log("Pet Age:", petAge);
    console.log("Pet Location:", petLocation);
});
