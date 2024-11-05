const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydb.sqlite');
const { createTables } = require('./createDatabase.js');

async function dropTables(){
    db.serialize(() => {

        // Delete tables
        db.run(`DROP TABLE IF EXISTS Admins;`
        , (err) => {
        if (err) {
            console.error('Error DROPING Admins table:', err.message);
        } else {
            console.log('Admins table DROPED successfully');
        }
        });

        db.run(`DROP TABLE IF EXISTS Employees;`
        , (err) => {
        if (err) {
            console.error('Error DROPING Employees table:', err.message);
        } else {
            console.log('Employees table DROPED successfully');
        }
        });

        db.run(`DROP TABLE IF EXISTS Teams;`
        , (err) => {
        if (err) {
            console.error('Error DROPING Teams table:', err.message);
        } else {
            console.log('Teams table DROPED successfully');
        }
        });

        db.run(`DROP TABLE IF EXISTS EmployeeTeamShiftAssociative;`
        , (err) => {
        if (err) {
            console.error('Error DROPING EmployeeTeamShiftAssociative table:', err.message);
        } else {
            console.log('EmployeeTeamShiftAssociative table DROPED successfully');
        }
        });

        db.run(`DROP TABLE IF EXISTS Shifts;`
        , (err) => {
        if (err) {
            console.error('Error DROPING Shifts table:', err.message);
        } else {
            console.log('Shifts table DROPED successfully');
        }
        });
    });
    
    db.close();
    await new Promise(resolve => setTimeout(resolve, 1000));
}

async function resetTables(){
    await dropTables();
    console.log("\n");
    await createTables();
}

resetTables();