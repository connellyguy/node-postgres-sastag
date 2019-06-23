function navPlayerList() {
    $.ajax({
    url: "/db/players/",
    success: function (result) {
            result.forEach((player, index) => {
                $("#nav-players-list").append(
                    '<li><a href="/charts/player/' + player.id + '" class="nav-sublink">' + player.first_name + ' ' + player.last_name + '</a></li>'
                );
            });
        },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() { 

    });
}

function dismissSidebar() {
    // hide overlay
    $('.overlay').removeClass('active');
    // hide sidebar
    $('#sidebar').removeClass('active');
};

$(document).ready(function() {
    navPlayerList();

    $("#menu-button").removeClass('d-none');

    $('#dismiss, .overlay').on('click', function () {
        dismissSidebar();
    });

    $('#menu-button').on('click', function() {
        // show overlay
        $('.overlay').addClass('active');
        // show sidebar
        $('#sidebar').addClass('active');
    });

    $('#playersCard').on('show.bs.collapse', function() {
        $('#players-plus').addClass('d-none');
        $('#players-minus').removeClass('d-none');
    });

    $('#playersCard').on('hide.bs.collapse', function() {
        $('#players-minus').addClass('d-none');
        $('#players-plus').removeClass('d-none');
    })
});