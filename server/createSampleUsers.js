const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./mydb.sqlite');

const samplePassword = `Password123`;

async function hashPassword(password){
    const saltingRounds = 10;
    return await bcrypt.hash(password, saltingRounds);
}

async function createSampleUsers(){
    db.all(`SELECT * FROM Users`, [], async (err, users) => {
        if(err){
            console.error('Error fetching Users: ', err.message);
            return;
        } else if(users.length > 0){
            console.log('Users table already has data. It remains Untouched.')
            return;
        } else {

            db.all(`SELECT * FROM Employees`, [], async (err, employees) => {
                if(err){
                    console.error('Error Fetching Employees: ', err.message);
                    return;
                }

                for(let employee of employees){
                    const passwordHash = await hashPassword(samplePassword);
                    const username = `${employee.employeeFName[0]}${employee.employeeLName}`.toLowerCase();
                    const role = employee.id === 1 ? 'Admin' : 'User';

                    db.run(`INSERT INTO Users (username, passwordHash, role, employeeID) VALUES (?,?,?,?)`, [username, passwordHash, role, employee.id], (err) => {
                        if(err) {
                            console.error(`Error inserting user for Employee ID ${employee.id}:`, err.message);
                        } else {
                            console.log(`User created for employee ID ${employee.id}`);
                        }
                    });

                }


            });
        }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
}


module.exports = { createSampleUsers };