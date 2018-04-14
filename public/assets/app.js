$("document").ready(function () {

    //event listener on scrape button, scrapes articles from New York Times."
    $(".scrape").on("click", function() {
        alert("Articles have been successfully scraped! Any duplicates will not be added to the database.")
        $.get("/scrape", function(data) {
            console.log("returned data......")
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
        let id = $(this).data("id");
        $(".new-comment-submit").data("id", id);
    });

    //event listener on submit button in new comment modal, posts new comment to server
    $(".new-comment-submit").on("click", function () {
        let id = $(this).data("id");
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
        $(".comments-section").empty();
        let id = $(this).data("id");
        $.get("/comments/" + id)
            .done(function(data) {
                let comments = data.comments;
                // console.log(comments);                
                comments.forEach((comment) => {
                    $(".comments-section").append(
                        `<div class="card" style="width:100% margin:5px">
                            <div class="card-body">
                                <h5 class="card-title">${comment.title}</h5>
                                <p class="card-text">${comment.body}</p>
                                <button type="button" data-id="${comment._id}" data-dismiss="modal" class="btn btn-danger remove-comment">Remove</button> 
                            </div>
                        </div>`
                    );
                });
                $("#comments-modal").modal("show");
            });
    });

    //event listener on remove comment button, removes comment from database.
    $(document).on("click", ".remove-comment", function() {
        let id = $(this).data("id");
        $.ajax({
            type: "DELETE",
            url: "/comments/" + id
        }).done(function(res) {
            console.log(res);
        })
    });

});