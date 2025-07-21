const db = require('../config/db');

const Sport = {
    getAllSports: (callback) => {
        const query = "SELECT * FROM sports";
        db.query(query, callback);
    },

    searchSports: (sport, callback) => {
        let query = "SELECT * FROM sports WHERE 1=1";
        const params = [];

        if (sport) {
            query += " AND (name LIKE ? OR type LIKE ?)";
            params.push(`%${sport}%`, `%${sport}%`);
        }

        db.query(query, params, callback);
    },

    getSportById: (sportId, callback) => {
        const query = "SELECT * FROM sports WHERE sportId = ?";
        db.query(query, [sportId], callback);
    },

    addSport: (sport, callback) => {
        const query = "INSERT INTO sports (name, noOfPlayer, sportType) VALUES (?, ?, ?)";
        const params = [sport.name, sport.noOfPlayer, sport.sportType];
        db.query(query, params, (error, results) => {
            if (error) {
                return callback(error);
            }
            const newSportId = results.insertId;
            Sport.getSportById(newSportId, callback);
        });
    },

    updateSport: (sportId, sport, callback) => {
        const query = "UPDATE sports SET name = ?, noOfPlayer = ?, sportType = ? WHERE sportId = ?";
        const params = [sport.name, sport.noOfPlayer, sport.sportType, sportId];
        db.query(query, params, (error, results) => {
            if (error) {
                return callback(error);
            }
            Sport.getSportById(sportId, callback);
        });
    },

    deleteSport: (sportId, callback) => {
        const query = "DELETE FROM sports WHERE sportId = ?";
        db.query(query, [sportId], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results.affectedRows > 0);
        });
    },

    getSportByName: (name, callback) => {
        const query = "SELECT * FROM sports WHERE name = ?";
        db.query(query, [name], callback);
    },

    getSportByType: (type, callback) => {
        const query = "SELECT * FROM sports WHERE type = ?";
        db.query(query, [type], callback);
    },

    getSportByNoOfPlayer: (noOfPlayer, callback) => {
        const query = "SELECT * FROM sports WHERE noOfPlayer = ?";
        db.query(query, [noOfPlayer], callback);
    },

}    

module.exports = Sport;