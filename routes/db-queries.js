let v_taggregate = '(SELECT a.it_id, a.first_name, a.last_name, a.user_name, a.image, a.number_of_its, a.time_as_it, a.time_as_it / a.number_of_its::double precision AS avg_time_as_it FROM ( SELECT d.it_id, u.first_name, u.last_name, u.user_name, u.image, count(d.it_id) AS number_of_its, sum(d.tag_diff) AS time_as_it FROM v_tagdiff d, users u WHERE d.it_id = u.id AND tag_time > (now() - $1::interval) GROUP BY d.it_id, u.first_name, u.last_name, u.user_name, u.image) a) v_taggregate';
module.exports = {

    getTimeline: (req, res, next) => {
        /* Returns data for the tag timeline chart */
        let timeframe = req.params.timeframe;
        var query = '';

        Promise.resolve()
        .then(()=> {
            if (timeframe == "all") {
                return Promise.resolve("SELECT * FROM v_tag_history ORDER BY tag_time ASC;");
            } else {
                return Promise.resolve({
                    text: "WITH INT AS (SELECT * FROM v_tag_history WHERE tag_time > (now() - $1::interval) ORDER BY tag_time ASC) SELECT * FROM v_tag_history WHERE tag_id = (SELECT max(tag_id) FROM v_tag_history where tag_id < (SELECT min(tag_id) as tag_id FROM INT)) UNION SELECT * FROM INT ORDER BY tag_id ASC;",
                    values: [timeframe],
                });
            }}).then((query) => {
                db.query(query, (err, result) => {
                    if (err) {
                        return next(createError(500,err));
                    } else { 
                        return res.json(result.rows); 
                    }
                })
        }).catch(() => {return next(createError(500))});
    },

    getLongTime: (req, res, next) => {
        /* Returns data for longest time as it chart */
        let timeframe = req.params.timeframe;
        var query = '';

        Promise.resolve()
        .then(()=> {
            if (timeframe == "all") {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY time_as_it LIMIT 15;",
                    values: ['999 years'],
                });
            } else {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY time_as_it LIMIT 15;",
                    values: [timeframe],
                });
            }}).then((query) => {
                db.query(query, (err, result) => {
                    if (err) {
                        return next(createError(500,err));
                    } else { 
                        return res.json(result.rows); 
                    }
                })
        }).catch(() => {return next(createError(500))});
    },

    getShortAvg: (req, res, next) => {
        /* Returns data for the shortest average time as it chart */
        let timeframe = req.params.timeframe;
        var query = '';

        Promise.resolve()
        .then(()=> {
            if (timeframe == "all") {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY avg_time_as_it LIMIT 15;",
                    values: ['999 years'],
                });
            } else {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY avg_time_as_it LIMIT 15;",
                    values: [timeframe],
                });
            }}).then((query) => {
                db.query(query, (err, result) => {
                    if (err) {
                        return next(createError(500,err));
                    } else { 
                        return res.json(result.rows); 
                    }
                })
        }).catch(() => {return next(createError(500))});
    },

    getMostTag: (req, res, next) => {
        /* Returns data for the most times tagged chart */
        let timeframe = req.params.timeframe;
        var query = '';

        Promise.resolve()
        .then(()=> {
            if (timeframe == "all") {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY number_of_its LIMIT 15;",
                    values: ['999 years'],
                });
            } else {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY number_of_its LIMIT 15;",
                    values: [timeframe],
                });
            }}).then((query) => {
                db.query(query, (err, result) => {
                    if (err) {
                        return next(createError(500,err));
                    } else { 
                        return res.json(result.rows); 
                    }
                })
        }).catch(() => {return next(createError(500))});
    },
}