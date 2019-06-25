module.exports = {
    getDashboard: (req, res) => {
        if(typeof req.userContext != 'undefined') {
            res.render('analytics-dashboard.ejs', {
                title: 'Welcome to SAS Tag | Charts',
                user: req.userContext.userinfo,
            });
        } else {
            res.render('analytics-dashboard.ejs', {
                title: 'Welcome to SAS Tag | Charts',
            });
        }
    },

    getPlayerCharts: (req, res) => {
        let playerId = req.params.id;
        let query = {
            text: "SELECT * FROM v_players WHERE id = $1 ",
            values: [playerId]
        };
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500,err));
            } else {
                if(typeof req.userContext != 'undefined') {
                    res.render('player-charts.ejs', {
                        title: 'Welcome to SAS Tag | Charts',
                        player: result.rows[0],
                        user: req.userContext.userinfo,
                    });
                } else {
                    res.render('player-charts.ejs', {
                        title: 'Welcome to SAS Tag | Charts',
                        player: result.rows[0],
                    });
                }
            }
        });
    }
};