let v_taggregate = '(SELECT a.it_id, a.first_name, a.last_name, a.user_name, a.image, coalesce(a.number_of_its, 0) as number_of_its, coalesce(a.time_as_it, 0) as time_as_it, CASE a.number_of_its WHEN 0 THEN 0 ELSE a.time_as_it / a.number_of_its::double precision END AS avg_time_as_it FROM ( SELECT u.id as it_id, u.first_name, u.last_name, u.user_name, u.image, count(d.it_id) AS number_of_its, sum(d.tag_diff) AS time_as_it FROM users u LEFT JOIN (SELECT * FROM v_tagdiff d WHERE d.tag_time > (now() - $1::interval)) d ON d.it_id = u.id GROUP BY u.id, u.first_name, u.last_name, u.user_name, u.image) a) v_taggregate';

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
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY time_as_it;",
                    values: ['999 years'],
                });
            } else {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY time_as_it;",
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
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY avg_time_as_it;",
                    values: ['999 years'],
                });
            } else {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY avg_time_as_it;",
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
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY number_of_its;",
                    values: ['999 years'],
                });
            } else {
                return Promise.resolve({
                    text: "SELECT * FROM " + v_taggregate + " ORDER BY number_of_its;",
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

    getPlayers: (req, res, next) => {
        let query = 'SELECT * from users order by id;';
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500,err));
            } else {
                return res.json(result.rows);
            }
        });
    },

    getTags: (req, res, next) => {
        let playerId = req.params.id;
        let timeframe = req.params.timeframe;
        Promise.resolve()
        .then(()=> {
            if (timeframe == "all") {
                return Promise.resolve({
                    text: "SELECT * FROM v_tagdiff where it_id = $1 ORDER BY tag_time ASC;",
                    values: [playerId],
                });
            } else {
                return Promise.resolve({
                    text: "SELECT * FROM v_tagdiff where it_id = $1 AND tag_time > (now() - $2::interval) ORDER BY tag_time ASC;",
                    values: [playerId,timeframe],
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

    getNumTags: (req, res, next) => {
        let timeframe = req.params.timeframe;
        Promise.resolve()
        .then(()=> {
            if (timeframe == "all") {
                return Promise.resolve({
                    text: "WITH num_view as (select distinct tagger_id, tagger_first_name, tagger_last_name, tagee_id, tagee_first_name, tagee_last_name, count(tag_id) as num_tags from v_tag_history where tagger_id != tagee_id group by 1, 2, 3, 4, 5, 6 order by num_tags desc) select tagger_id, tagger_first_name, tagger_last_name, tagee_id, tagee_first_name, tagee_last_name, num_tags, num_tags/(SELECT max(num_tags) from num_view)::double precision as num_tags_pct FROM num_view;",
                });
            } else {
                return Promise.resolve({
                    text: "WITH num_view as (select distinct tagger_id, tagger_first_name, tagger_last_name, tagee_id, tagee_first_name, tagee_last_name, count(tag_id) as num_tags from v_tag_history where tagger_id != tagee_id and tag_time > (now() - $1::interval) group by 1, 2, 3, 4, 5, 6 order by num_tags desc) select tagger_id, tagger_first_name, tagger_last_name, tagee_id, tagee_first_name, tagee_last_name, num_tags, num_tags/(SELECT max(num_tags) from num_view)::double precision as num_tags_pct FROM num_view;",
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

    getNumTagsAgg: (req, res, next) => {
        let timeframe = req.params.timeframe;
        Promise.resolve()
        .then(()=> {
            if (timeframe == "all") {
                return Promise.resolve({
                    text: "select u.*, coalesce(t.num_tags,0) as num_tags from users u left join (select tagger_id, count(tag_id) as num_tags from tag_history where tagger_id <> tagee_id group by tagger_id) t on u.id = t.tagger_id order by id;",
                });
            } else {
                return Promise.resolve({
                    text: "select u.*, coalesce(t.num_tags,0) as num_tags from users u left join (select tagger_id, count(tag_id) as num_tags from tag_history where tagger_id <> tagee_id and tag_time > (now() - $1::interval) group by tagger_id) t on u.id = t.tagger_id order by id;",
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
    }
}