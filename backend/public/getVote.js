// Function to clear card
function clearCard() {
    $('#vote-id').val("");
    $('#vote-topic').val("");
    $('#vote-description').text("");
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
        success: function (result) {
            // Show the modal
            var myModal = new bootstrap.Modal($('#successModal'), {});
            myModal.show();
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

// // Remove a Student record from ledger
function deleteVotingTopic() {
    var voteid = $('#editvotingId').text(); // Get the value from the element
    $.ajax({
        url: 'votes/' + voteid, // append the studentId to your API endpoint
        type: 'DELETE',
        success: function (result) {
            // Show the modal
            var myModal = new bootstrap.Modal($('#successModal'), {});
            myModal.show();
            console.log(result);
        },
        error: function (error) {
            // Handle error
            console.log(error);
        }
    }).always(function () {
        // This function is always called, regardless of whether the request was successful or not
        // Clear the card
        clearCard();
        $('#confirmModal').modal('hide');
        $('#yesButton').off("click");
    });
}

// // Edit a Student record in the ledger
function updateVotingDetails() {
    var votingtopic = $('#edit-voting-topic').val();
    var votingdescription = $('#edit-voting-description').val();

    var data = {
        topic: votingtopic,
        description: votingdescription,
    };
    var voteid = $('#editvotingId').text();
    $.ajax({
        url: 'votes/' + voteid,
        type: 'PUT',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
            var myModal = new bootstrap.Modal($('#successModal'), {});
            myModal.show();
            clearCard()
            console.log(result);
        },
        error: function (error) {
            // Handle error
            console.log(error);
        }
    }).always(function () {
        // This function is always called, regardless of whether the request was successful or not
        // Clear the card
        clearCard();
        $('#confirmModal').modal('hide');
        $('#yesButton').off("click");
    });
}

// Update voting status
function updateVotingStatus() {
    var votingId = $('#editvotingId').text();
    console.log(votingId)
    $.ajax({
        url: '/votes/' + votingId,
        type: 'POST', // Change to POST since we're updating the status
        contentType: 'application/json',
        success: function (result, textStatus, xhr) {
            var status = xhr.status;
            if (status === 200) {
                var myModal = new bootstrap.Modal($('#successModal'), {});
                myModal.show();
                clearCard()
                console.log('Voting status updated successfully:', result);
                $('#confirmModal').modal('hide');
            } else {
                console.error('Failed to update voting status: Unexpected status code', status);
            }
        },
        error: function (error) {
            console.error('Failed to update voting status:', error);
        }
    });
}

$(document).ready(function () {
    // Attach event listeners to the buttons
    $('#createstudentForm1').on('submit', function (e) {
        e.preventDefault();
        $('#yesButton').off("click");
        $('#yesButton').click(createVotingTopic); $('#confirmModal').modal('show');
    });

    $('#deleteButton').click(function () {
        $('#yesButton').off("click");
        $('#yesButton').click(deleteVotingTopic);
        $('#confirmModal').modal('show');
    });
    $('#updateButton').click(function () {
        $('#yesButton').off("click");
        $('#yesButton').click(updateVotingDetails);
        $('#confirmModal').modal('show');
    });
    $('#statusButton').click(function () {
        $('#yesButton').off("click");
        $('#yesButton').click(updateVotingStatus);
        $('#confirmModal').modal('show');
    });

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
