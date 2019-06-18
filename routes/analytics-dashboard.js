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
};