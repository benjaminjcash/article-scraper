$(document).ready(function () {

    //event listener on scrape button, send get request to "/scrape."
    $(".scrape").on("click", function() {
        $.get("/scrape", function(data) {
            console.log(data);          
        });
    });

    $(".display").on("click", function() {
        window.location.href = "/display";
    });

});