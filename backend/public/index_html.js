// Function to clear card
function clearCard() {
    $('#vote-id').val("");
    $('#vote-topic').val("");
    $('#vote-description').text("");
    $('#edit-voting-topic').val("");
    $('#edit-voting-description').val("");
    $('#editovenStatus').val("");
    $('#editflourStatus').val("");
    $('#message').text("");
    $('#editStudentForm').addClass('d-none');
}

// Function to call when 'No' is clicked
function noFunction() {
    $('#confirmModal').modal('hide');
}

// Add Student record to ledger
function createVotingTopic() {
    // Get form data
    var voteid = $('#vote-id').val();
    var voteTopic = $('#vote-topic').val();
    var voteDescription = $('#vote-description').val();
    var data = {
        id: voteid,
        topic: voteTopic,
        description: voteDescription,
    };
    // Send a POST request to the server
    $.ajax({
        url: '/votes', // replace with your URL
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result, status) {
            if (status === "success") {
                // Show the modal
                var myModal = new bootstrap.Modal($('#successModal'), {});
                myModal.show();
                // Hide the modal after a brief delay
                setTimeout(function () {
                    myModal.hide();
                }, 2000); // Adjust the delay as needed
            }
        },
        error: function (error) {
            console.log(error);
        }
    }).always(function () {
        // This function is always called, regardless of whether the request was successful or not
        // Clear the form
        $('form')[0].reset();
        $('#confirmModal').modal('hide');
        $('#yesButton').off("click");
    });
}

// Function to handle casting vote
function castVote(voteType) {
    var voteId = $('#editvotingId').text();
    $.ajax({
        url: '/votes/' + voteId + '/' + voteType,
        type: 'POST',
        success: function (result) {
            var myModal = new bootstrap.Modal($('#successModal'), {});
            myModal.show();
            clearCard()
            console.log('Vote cast successfully:', result);
        },
        error: function (error) {
            console.error('Failed to cast vote:', error);
        }
    });
}

$(document).ready(function () {
    $('#confirmModal').on('hidden.bs.modal', function () {
        console.log(result); 
    });

    // Attach event listeners to the buttons
    $('#noButton').click(noFunction);

    // Event listener for "Yes" button
    $('#yesButton').click(function () {
        castVote('yes');
    });

    // Event listener for "No" button
    $('#noButton').click(function () {
        castVote('no');
    });

    // Fetch all students and display them
    // Handle form submission
    $('#getstudentForm').on('submit', function (e) {
        e.preventDefault();
        var searchId = $('#searchId').val();
        $.ajax({
            url: 'votes/' + searchId,
            type: 'GET',
            success: function (data) {
                data = JSON.parse(data); // Parse into an object
                console.log(data)
                $('#editvotingId').text(data.id);
                $('#edit-voting-topic').val(data.topic);
                $('#edit-voting-description').val(data.description);
                $('#yes-votes').val(data.yes);
                $('#no-votes').val(data.no);
                $('#vote-status').val(data.status);

                $('#editStudentForm').removeClass('d-none');
            },
            error: function (error) {
                clearCard();
                $('#message').text("Not Found");
                console.log(error);
            }
        });
    });
});
