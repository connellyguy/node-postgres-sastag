module.exports = {
    getPlayerList: (req, res) => {
        let query = "SELECT * FROM v_players ORDER BY last_name ASC"; // query database to get all the players

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                res.redirect('/');
            } else {
                if(typeof req.userContext != 'undefined') {
                    res.render('player-list.ejs', {
                        title: 'Welcome to SAS Tag | View Players'
                        ,players: result,
                        user: req.userContext.userinfo
                    });
                } else {
                    res.render('player-list.ejs', {
                        title: 'Welcome to SAS Tag | View Players'
                        ,players: result,
                    });
                }
            }
        });
    },
};
