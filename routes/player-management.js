const fs = require('fs');

module.exports = {
    addPlayerPage: (req, res) => {
        const query = "SELECT * FROM v_last_tag"; // query database to get last tag info

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500, err));
                console.log("Database Error while loading add-player.js");
                console.log(err);
            } else {
                if(typeof req.userContext != 'undefined') {
                    res.render('add-player.ejs', {
                        title: 'Welcome to SAS Tag | Add a Player'
                        ,player: result.rows[0],
                        user: req.userContext.userinfo,
                        message: ''
                    });
                } else {
                    res.render('add-player.ejs', {
                        title: 'Welcome to SAS Tag | Add a Player'
                        ,player: result.rows[0],
                        message: ''
                    });
                }
            }

        });
    },
    addPlayer: (req, res, next) => {
        if (!req.files) {
            return next(createError(400,"No files were uploaded."));
        }

        let message = '';
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let username = req.body.username;
        let email = req.body.email;
        let subscribe = (req.body.subscribe === "yes") ? 'TRUE' : 'FALSE';
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = username + '.' + fileExtension;

        const usernameQuery = {
            text: "SELECT * FROM v_players WHERE user_name = $1",
            values: [username]
        };
        console.log(usernameQuery);

        db.query(usernameQuery, (err, result) => {
            if (err) {
                return next(createError(500,err));
            }
            if (typeof result.rows[0] !== "undefined") {
                return next(createError(400,'Username already exists in database'));
            } else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    fs.writeFile(`public/assets/img/${image_name}`, uploadedFile.data, function (err ) {
                        if (err) {
                            return next(creatError(500,err));
                        }
                        // send the player's details to the database
                        const query = {
                            text: "INSERT INTO users (first_name, last_name, image, user_name, email_address, subscribe) VALUES ($1, $2, $3, $4, $5, $6);",
                            values: [first_name, last_name, image_name, username, email, subscribe]
                        };
                        db.query(query, (err, result) => {
                            if (err) {
                                return next(createError(500,err));
                            }
                            if (typeof req.body.add_button != "undefined" && req.body.add_button == "add-and-tag") {
                                const tag_query = {
                                    text: "SELECT distinct max(id) as new_id FROM users;",
                                }
                                db.query(tag_query, (err,result) => {
                                    if (err) {
                                        return next(createError(500,err));
                                    } else {
                                        let player=result.rows[0];
                                        res.redirect('/tag/'+player.new_id);
                                    }
                                });
                            } else {
                                res.redirect('/');
                            }
                        });
                    });
                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                    res.render('add-player.ejs', {
                        message,
                        title: 'Welcome to SAS Tag | Add a new player'
                    });
                }
            }
        });
    },
    editPlayerPage: (req, res, next) => {
        let playerId = req.params.id;
        let query = {
            text: "SELECT * FROM v_players WHERE id = $1 ",
            values: [playerId]
        };
        db.query(query, (err, result) => {
            if (err) {
                return next(createError(500,err));
            } else {
                res.render('edit-player.ejs', {
                    title: 'Welcome to SAS Tag | Edit Player'
                    ,player: result.rows[0],
                    user: req.userContext.userinfo,
                    message: ''
                });
            }
        });
    },
    editPlayer: (req, res, next) => {
        let playerId = req.params.id;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let username = req.body.username;
        let subscribe = (req.body.subscribe === "yes") ? 'TRUE' : 'FALSE';

        if (Object.keys(req.files).length) {
            let uploadedFile = req.files.image;
            let image_name = uploadedFile.name;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            image_name = username + '.' + fileExtension;

            if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    fs.writeFile(`public/assets/img/${image_name}`, uploadedFile.data, function (err ) {
                        if (err) {
                            return next(creatError(500,err));
                        }
                    });
            } else {
                return next(createError(err,"Filetype must be png, jpeg, or gif"));
            }

            let query = {
            text: "UPDATE users SET first_name = $1, last_name = $2, image=$3, subscribe=$5 WHERE users.id = $4",
            values: [first_name, last_name, image_name, playerId, subscribe]
            };
            db.query(query, (err, result) => {
                if (err) {
                    return next(createError(500, err));
                }
                res.redirect('/players');
            });
        } else {
            let query = {
            text: "UPDATE users SET first_name = $1, last_name = $2, subscribe=$4 WHERE users.id = $3",
            values: [first_name, last_name, playerId, subscribe]
            };
            db.query(query, (err, result) => {
                if (err) {
                    return next(createError(500, err));
                }
                res.redirect('/players');
            });
        }
    },
    deletePlayer: (req, res, next) => {
        let playerId = req.params.id;
        const getImageQuery = {
            text: 'SELECT image from users WHERE id = $1',
            values: [playerId]
        };
        const deleteUserQuery = {
            text: 'DELETE FROM users WHERE id = $1',
            values: [playerId]
        };

        db.query(getImageQuery, (err, result) => {
            if (err) {
                return next(createError(500, err));
            }

            let image = result.rows[0].image;

            fs.unlink(`public/assets/img/${image}`, (err) => {
                if (err) {
                    return next(createError(500, err));
                }
                db.query(deleteUserQuery, (err, result) => {
                    if (err) {
                        return next(createError(500, err));
                    }
                    res.redirect('/');
                });
            });
        });
    }
};