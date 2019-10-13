var sqlite3 = require('sqlite3').verbose()


const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE slider (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title,
            imageurl text, 
            description text,            
            CONSTRAINT title_unique UNIQUE (title)
            )`,
        (err) => {
            if (err) {
                // Table already created
                // console.log(err)
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO slider (title,imageurl, description) VALUES (?,?,?)'
                db.run(insert, ["Title-1","/PathToImage1","This is image 1"])
                db.run(insert, ["Title-2","/PathToImage2","This is Image 2"])
            }
        });  
    }
});


module.exports = db