module.exports = {
    getDashboard: (req, res) => {
        // query database for last month of tag history
        let query = "SELECT * FROM v_tag_history WHERE tag_time > (select distinct max(tag_time) - '1 month'::interval FROM tag_history) ORDER BY tag_time ASC;";

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500,err));
            }
            if(typeof req.userContext != 'undefined') {
                res.render('analytics-dashboard.ejs', {
                    title: 'Welcome to SAS Tag | Charts',
                    user: req.userContext.userinfo,
                    tag_history: result,
                });
            } else {
                res.render('analytics-dashboard.ejs', {
                    title: 'Welcome to SAS Tag | Charts',
                    tag_history: result,
                });
            }
        });
    },
};