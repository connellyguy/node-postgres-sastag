module.exports = {
    getDashboard: (req, res) => {
        // query database for last month of tag history
        let longtime_query = "SELECT * FROM v_taggregate ORDER BY time_as_it LIMIT 15;";
        let shortavg_query = "SELECT * FROM v_taggregate ORDER BY avg_time_as_it LIMIT 15;";
        let mosttag_query = "SELECT * FROM v_taggregate ORDER BY number_of_its DESC LIMIT 15;";

        // execute queries
        db.query(longtime_query, (err, lt_result) => {
            if (err) {
                return next(createError(500,err));
            }
            db.query(shortavg_query, (err, sa_result) => {
                if (err) {
                    return next(createError(500,err));
                }
                db.query(mosttag_query, (err, mt_result) => {
                    if (err) {
                        return next(createError(500,err));
                    }   
                    if(typeof req.userContext != 'undefined') {
                        res.render('analytics-dashboard.ejs', {
                            title: 'Welcome to SAS Tag | Charts',
                            user: req.userContext.userinfo,
                            longest_time: lt_result,
                            shortest_avg: sa_result,
                            most_tags: mt_result,
                        });
                    } else {
                        res.render('analytics-dashboard.ejs', {
                            title: 'Welcome to SAS Tag | Charts',
                            longest_time: lt_result,
                            shortest_avg: sa_result,
                            most_tags: mt_result,
                        });
                    }
                });
            });
        });
    },
};