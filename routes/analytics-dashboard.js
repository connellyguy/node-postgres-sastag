module.exports = {
    getDashboard: (req, res) => {
        // query database for last month of tag history
        let query = "SELECT * FROM v_tag_history WHERE tag_time > (select distinct max(tag_time) - '1 month'::interval FROM tag_history) ORDER BY tag_time ASC;";
        let longtime_query = "SELECT * FROM v_taggregate ORDER BY time_as_it LIMIT 10;";
        let shortavg_query = "SELECT * FROM v_taggregate ORDER BY avg_time_as_it LIMIT 10;";
        let mosttag_query = "SELECT * FROM v_taggregate ORDER BY number_of_its DESC LIMIT 10;";

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500,err));
            }

            db.query(longtime_query, (err, lt_result) => {
                if (err) {
                    return next(createError(500,err));
                }
                
                if(typeof req.userContext != 'undefined') {
                    res.render('analytics-dashboard.ejs', {
                        title: 'Welcome to SAS Tag | Charts',
                        user: req.userContext.userinfo,
                        tag_history: result,
                        longest_time: lt_result,
                    });
                } else {
                    res.render('analytics-dashboard.ejs', {
                        title: 'Welcome to SAS Tag | Charts',
                        tag_history: result,
                        longest_time: lt_result,
                    });
                }
            });
        });
    },
};