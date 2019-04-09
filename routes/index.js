module.exports = {
    getHomePage: (req, res, next) => {
        const query = "SELECT * FROM v_last_tag"; // query database to get last tag info

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500, err));
                console.log("Database Error while loading index.js");
                console.log(err);
            } else {
                if(typeof req.userContext != 'undefined') {
                    res.render('index.ejs', {
                        title: 'Welcome to SAS Tag | Who\'s IT?'
                        ,player: result.rows[0],
                        user: req.userContext.userinfo
                    });
                } else {
                    res.render('index.ejs', {
                        title: 'Welcome to SAS Tag | Who\'s IT?'
                        ,player: result.rows[0],
                    });
                }
            }

        });
    },
};
