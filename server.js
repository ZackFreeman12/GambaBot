const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
const express = require('express');
const { deleteToken } = require('./config.json')
const app = express();


app.use(express.json());


app.get("/api/get/:userid", async function (req, res) {

    // get the data to be sent back 
    const data =
        await db.all("SELECT rowid as id, points, streak, lifetime FROM Users where userid = ?", [req.params.userid]);

    // output data to console for debugging
    console.log(JSON.stringify(data));

    // send back table data as JSON data
    res.json(data);
});



app.post("/api/new-user", async function (req, res) {

    // insert the new data 
    await db.run("INSERT INTO Users VALUES(?,?,?,?)", [req.body.userid, req.body.points, req.body.streak, req.body.lifetime]);

    const data = { "status": "CREATE ENTRY SUCCESSFUL" }

    // output data to console for debugging
    console.log(JSON.stringify(data));

    // send back table data as JSON data
    res.json(data);
});

app.put("/api/update/:userid", async function (req, res) {

    //update the entry with new data at the id
    await db.run("UPDATE Users SET points=?, streak=?, lifetime=? WHERE userid =?", [req.body.points, req.body.streak, req.body.lifetime, req.params.userid]);

    const data = { "status": "UPDATE ITEM SUCCESSFUL" }

    // output data to console for debugging
    console.log(JSON.stringify(data));

    // send back table data as JSON data
    res.json(data);
});

app.delete('/api/' + deleteToken, async function (req, res) {

    // delete the entries in movies table
    await db.run("DELETE FROM Users");

    const data = { "status": "DELETE COLLECTION SUCCESSFUL" }

    // output data to console for debugging
    console.log(JSON.stringify(data));

    // send back table data as JSON data
    res.json(data);
});

async function startup() {
    // create the database connection
    db = await sqlite.open({
        filename: 'gamba.db',
        driver: sqlite3.Database
    });

    // start the server
    const server = app.listen(3000, function () {
        console.log("RESTful API listening on port 3000!")
    });
}

startup();