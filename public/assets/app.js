$("document").ready(function () {
    let id;

    //event listener on scrape button, scrapes articles from New York Times."
    $(".scrape").on("click", function() {
        $.get("/scrape", function(data) {
            console.log(data);          
        });
    });

    //event listener on display button, loads "scraped articles" page 
    $(".display").on("click", function() {
        window.location.href = "/display";
    });

    //event listener on write comment button, shows "write comment" model
    $(".write-comment").on("click", function() {
        $("#new-comment-modal").modal("show");
        id = $(this).data("id");
    });

    //event listener on submit button in new comment modal, posts new comment to server
    $(".new-comment-submit").on("click", function () {
        
        let comment = {
            title: $("#comment-title").val().trim(),
            body: $("#comment-text").val().trim()
        }

        $("#comment-title").val("");
        $("#comment-text").val("");

        let url = "/articles/" + id;

        $.ajax({
            type: "POST",
            url: url,
            data: comment
        }).done(function (res) {
            console.log(res);
        })
    });

    //event listener on see comments button, opens "comments" modal.
    $(".display-comments").on("click", function() {
        $("#comments-modal").modal("show");
        id = $(this).data("id");

        $.get("/comments/" + id)
            .done(function(data) {
                $(".comments-section").append(`
                <h6>${data.comment.title}</h6>
                <p>${data.comment.body}<p>
                `)
                console.log(data);
            })
    });

});