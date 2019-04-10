module.exports = {
    getHomePage: (req, res, next) => {
        const query = "SELECT * FROM v_last_tag"; // query database to get last tag info
        const hist_query = "SELECT * FROM v_tag_history ORDER BY tag_id DESC LIMIT 10";

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500, err));
            } else {
                db.query(hist_query, (err2, hist_result) => {
                    if (err) {
                        return next(createError(500, err2));
                    } else {
                        if(typeof req.userContext != 'undefined') {
                            res.render('index.ejs', {
                                title: 'Welcome to SAS Tag | Who\'s IT?',
                                player: result.rows[0],
                                hist: hist_result,
                                user: req.userContext.userinfo
                            });
                        } else {
                            res.render('index.ejs', {
                                title: 'Welcome to SAS Tag | Who\'s IT?',
                                player: result.rows[0],
                                hist: hist_result,
                            });
                        }
                    }
                });
            }

        });
    },
};
