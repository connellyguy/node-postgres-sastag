const fs = require('fs');

module.exports = {
    addPlayerPage: (req, res) => {
                if(typeof req.userContext != 'undefined') {
                    res.render('add-player.ejs', {
                        title: 'Welcome to SAS Tag | Add a Player',
                        user: req.userContext.userinfo,
                        message: ''
                    });
                } else {
                    res.render('add-player.ejs', {
                        title: 'Welcome to SAS Tag | Add a Player',
                        message: ''
                    });
                }

        },
    addPlayer: (req, res, next) => {
        if (!req.files || !req.files.image) {
            return next(createError(400,"No image was uploaded."));
        }
        let login_email = req.userContext.userinfo.preferred_username;
        let message = '';
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let username = req.body.username;
        let email = req.body.email;
        let subscribe = (req.body.subscribe === "yes") ? 'TRUE' : 'FALSE';
        let hex_color = req.body.color.replace('#','');
        let color = parseInt(hex_color.substring(0,2), 16) + ',' + parseInt(hex_color.substring(2,4), 16) + ',' + parseInt(hex_color.substring(4,6), 16);
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = username + '.' + fileExtension;
        let added_by = 0;

        const usernameQuery = {
            text: "SELECT * FROM users WHERE user_name = $1",
            values: [username],
        };

        const addedbyQuery = {
            text: "SELECT * FROM users WHERE email_address = $1",
            values: [login_email],
        };

        db.query(addedbyQuery, (err0, ab_res) => {
            if (err0) {
                return next(createError(500,err0));
            }
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
                            let adder = ab_res.rows[0];
                            if (typeof adder !== "undefined") {
                                added_by = adder.id;
                            }
                            // send the player's details to the database
                            const query = {
                                text: "INSERT INTO users (first_name, last_name, image, user_name, email_address, subscribe, added_by, color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);",
                                values: [first_name, last_name, image_name, username, email, subscribe, added_by, color]
                            };
                            db.query(query, (err, result) => {
                                if (err) {
                                    return next(createError(500,err));
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
        });
    },
    editPlayerPage: (req, res, next) => {
        let playerId = req.params.id;
        let query = {
            text: "SELECT * FROM users WHERE id = $1 ",
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
        let hex_color = req.body.color.replace('#','');
        let color = parseInt(hex_color.substring(0,2), 16) + ',' + parseInt(hex_color.substring(2,4), 16) + ',' + parseInt(hex_color.substring(4,6), 16);
        let subscribe = (req.body.subscribe === "yes") ? 'TRUE' : 'FALSE';

        if (req.files && req.files.image) {
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
            text: "UPDATE users SET first_name = $1, last_name = $2, image=$3, subscribe=$5, color=$6 WHERE users.id = $4",
            values: [first_name, last_name, image_name, playerId, subscribe, color]
            };
            db.query(query, (err, result) => {
                if (err) {
                    return next(createError(500, err));
                }
                res.redirect('/players');
            });
        } else {
            let query = {
            text: "UPDATE users SET first_name = $1, last_name = $2, subscribe=$4, color=$5 WHERE users.id = $3",
            values: [first_name, last_name, playerId, subscribe, color]
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