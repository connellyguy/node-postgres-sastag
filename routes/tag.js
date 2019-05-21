module.exports = {
    getTagPage: (req, res) => {
        let query = "SELECT * FROM v_players WHERE id NOT IN (SELECT tagger_id from v_last_tag) AND id NOT IN (SELECT tagee_id from v_last_tag) ORDER BY last_name ASC;"; // query database to get all the players

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500,err));
            }
            if(typeof req.userContext != 'undefined') {
                res.render('tag-player.ejs', {
                    title: 'Welcome to SAS Tag | Tag a Player'
                    ,players: result,
                    user: req.userContext.userinfo,
                });
            } else {
                res.render('tag-player.ejs', {
                    title: 'Welcome to SAS Tag | Tag a Player'
                    ,players: result,
                });
            }
        });
    },

    tagPlayer: (req, res, next) => {
        let tageeId = req.params.id;
        let tag_message = req.body.message_text;
        let query = {
            text: "INSERT INTO tag_history(tagger_id, tagee_id, tag_message) SELECT tagee_id AS tagger_id, $1 AS tagee_id, $2 as tag_message FROM v_last_tag;",
            values: [tageeId, tag_message],
        };

        //execute query
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500, err));
            } else {

                let last_tag_query = {
                    text: "SELECT * FROM v_last_tag;",
                };

                db.query(last_tag_query, (err, lt_res) => {
                    if (err) {
                        return next(createError(500, err));
                    } else {
                        
                        let lt=lt_res.rows[0];
                        let tagger_first_name = lt.tagger_first_name;
                        let tagger_last_name = lt.tagger_last_name;
                        let tagee_first_name = lt.tagee_first_name;
                        let tagee_last_name = lt.tagee_last_name; 
                        let tag_time = lt.tag_time;
                        let tag_message = lt.tag_message;

                        var date = new Date(tag_time);
                        date.setHours(date.getUTCHours() - 4);
                        var year = date.getUTCFullYear();
                        var month = date.getUTCMonth() + 1; // getMonth() is zero-indexed, so we'll increment to get the correct month number
                        var day = date.getUTCDate();
                        var hours = date.getUTCHours();
                        var minutes = date.getUTCMinutes();
                        var seconds = date.getUTCSeconds();

                        hours = (hours == 0) ? '12' : hours;
                        ampm = (hours < 12) ? 'AM' : 'PM';
                        hours = (hours > 12) ? hours - 12 : hours;
                        minutes = (minutes < 10) ? '0' + minutes : minutes;
                        seconds = (seconds < 10) ? '0' + seconds: seconds;                        
                        
                        let emailquery = "SELECT string_agg(email_address,',') as email_string FROM users where subscribe;";

                        db.query(emailquery, (err, email_result) => {
                            if (err) {
                                return next(createError(500, err));
                            } else {
                                let addresses = email_result.rows[0].email_string;
                                if (addresses.length > 0) {

                                    res.render('tag_alert_email.ejs', {
                                        tagee_first_name: tagee_first_name,
                                        tagee_last_name: tagee_last_name,
                                        tagger_first_name: tagger_first_name,
                                        tagger_last_name: tagger_last_name,
                                        hours: hours,
                                        minutes: minutes,
                                        seconds: seconds,
                                        ampm: ampm,
                                        month: month,
                                        day: day,
                                        year: year,
                                        tag_message: tag_message
                                    }, function(err, html) {

                                        var mailOptions = {
                                            from: '"SAS Tag" <noreplywhoisitsas.com@gmail.com>', // sender address
                                            to: email_result.rows[0].email_string, // list of receivers
                                            subject: "Tag Alert: " + tagee_first_name + " is IT", // Subject line
                                            html: html,
                                        };

                                      let info = transporter.sendMail(mailOptions)
                                    });
                                }
                            }
                        });
                        res.redirect('/');
                    }
                });
            }
        });
    }
};