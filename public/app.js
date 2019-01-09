// Set a reference to the result display div to display dynamic content
var resultDisplayDiv = $("#resultDisplay");
// Scrape from cbc.com and save to db
$(document).on("click", "#scrape", function() {
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function(response) {
        console.log(response);
        // Grab the articles as a json
        $.getJSON("/articles", function(data) {
            // display results        
            displayArticles(data);
        });
    });
});

$(document).on("click", "#clear", function(){
    resultDisplayDiv.empty();
});
$(document).on("click", ".showNotes", generateNoteModal);
$(document).on("click", ".saveNote", saveNoteAndUpdate);


// Render each articles as a bootstrap card component
function generateArticle(articleJSON) {
    var card = $("<div class='card'>");
    var cardHeader = $(
    `<div class='card-header'>
        <h3>
            <a class='article-header' target='_blank' rel='noopener noreferrer'
            href='${articleJSON.link}'>${articleJSON.title}</a>
            <a class='btn btn-info showNotes' id='${articleJSON._id}'>See Notes</a>
        </h3>
    </div>`);
    var cardBody = $("<div class='card-body'>").text(articleJSON.description);
    
    card.append(cardHeader, cardBody);
    card.data("_id", articleJSON._id);

    return card;
};
function displayArticles(articles) {
    var articleCollection = [];
    for (let i = 0; i < articles.length; i++) {
        articleCollection.push(generateArticle(articles[i]));
    };
    resultDisplayDiv.append(articleCollection);
};

function generateNoteModal() {
    var thisId = $(this).attr("id");

    var noteModal = $("#noteModal").children(".modal-dialog").children(".modal-content").children(".modal-body");
    noteModal.empty();
    var noteBox = $("<div class='noteBox'>");
    var noteList = $("<ul class='list-group noteList>")
    var inputBox = $("<textarea id='inputBox' placeholder='Enter your notes' rows='4' cols='60'></textarea>");
    var saveNoteBtn = $(`<button class='btn btn-success saveNote' id='${thisId}'>Save</button>`);
    noteBox.append(noteList, inputBox, saveNoteBtn);
    noteModal.append(noteBox);

    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    }).then(function(data) {
        console.log(data);
        if (data.notes) {
            var notes = $(`<li class='list-group-item'>${data.notes.body}</li>`);
            noteList.append(notes);
        } else {
            var notes = $("<li class='list-group-item'>Looks like there are no notes at this time...</li>");
            noteList.append(notes);
        };
        $("#noteModal").modal("show");
    });
};

function saveNoteAndUpdate(){
    var thisId = $(this).attr("id");
    console.log(thisId);
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {        
        // Value taken from note textarea
        body: $("#inputBox").val()
        }
    }).then(function(data) {
        // Log the response
        console.log(data);
        $("#noteModal").modal("hide");
        generateNoteModal();
    });
};

//   // Whenever someone clicks a p tag
//   $(document).on("click", "p", function() {
//     // Empty the notes from the note section
//     $("#notes").empty();
//     // Save the id from the p tag
//     var thisId = $(this).attr("data-id");
  
//     // Now make an ajax call for the Article
//     $.ajax({
//       method: "GET",
//       url: "/articles/" + thisId
//     })
//       // With that done, add the note information to the page
//       .then(function(data) {
//         console.log(data);
//         // The title of the article
//         $("#notes").append("<h2>" + data.title + "</h2>");
//         // An input to enter a new title
//         $("#notes").append("<input id='titleinput' name='title' >");
//         // A textarea to add a new note body
//         $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//         // A button to submit a new note, with the id of the article saved to it
//         $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
//         // If there's a note in the article
//         if (data.notes) {
//           // Place the title of the note in the title input
//           $("#titleinput").val(data.notes.title);
//           // Place the body of the note in the body textarea
//           $("#bodyinput").val(data.notes.body);
//         }
//       });
//   });
  
//   // When you click the savenote button
//   $(document).on("click", "#savenote", function() {
//     // Grab the id associated with the article from the submit button
//     var thisId = $(this).attr("data-id");
  
//     // Run a POST request to change the note, using what's entered in the inputs
//     $.ajax({
//       method: "POST",
//       url: "/articles/" + thisId,
//       data: {
//         // Value taken from title input
//         title: $("#titleinput").val(),
//         // Value taken from note textarea
//         body: $("#bodyinput").val()
//       }
//     })
//       // With that done
//       .then(function(data) {
//         // Log the response
//         console.log(data);
//         // Empty the notes section
//         $("#notes").empty();
//       });
  
//     // Also, remove the values entered in the input and textarea for note entry
//     $("#titleinput").val("");
//     $("#bodyinput").val("");
//   });