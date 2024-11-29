
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const jwt = require('jsonwebtoken');
const secretKey = 'secret_key'; //store somewhere else and change later.
const { authenticateToken, authenticateAdmin } = require('./authenticateToken.js');


// Middleware
app.use(cors());
app.use(express.json());

// Database setups
const db = new sqlite3.Database('./mydb.sqlite', (err) => {
    if (err) {
    console.error('Error opening database:', err.message);
    } else {
    console.log('Connected to SQLite database');
    }
});

//register a new user. users can register themselves, but existing admins must register other admins.
app.post('/api/register', async (req, res) => {
    const { username, password, role, employeeFName, employeeLName } = req.body;
    const acceptableRoles = ['Admin', 'User'];

    if(!username || !password){
        return res.status(400).json({error: "Username and Password are required."});
    }
    if(role && !(acceptableRoles.includes(role))){
        return res.status(400).json({error: "role not acceptable"});
    }
    //if the user is trying to register as an admin, an admin will have to approve - an admin JWT must be passed as well.
    if(role === 'Admin'){
        let userToken;
        const token = req.headers['authorization']?.split(' ')[1];
        if(!token) {
            return res.status(400).json({error: "Bad Token. Admin priveledges required to register a new admin account"});
        }
        
        jwt.verify(token, secretKey, (err, user) => {
            if(err){
                return res.status(403).json({error: "Bad Token. Admin priveledges required to register a new admin account"});
            }
            req.user = user;
            userToken = user;
        });
        if(!userToken.role || userToken.role !== 'Admin'){
            return res.status(400).json({error: "Admin priveledges required to register a new admin account"});
        }

    }

    //attempt to add the new user to the database
    try{
        const passwordHash = await bcrypt.hash(password, saltRounds);

        db.serialize(()=>{
            db.run("BEGIN TRANSACTION");

            let employeeID = null;
            const employeeQuery = `INSERT INTO Employees (employeeFName, employeeLName) VALUES (?,?)`;
            let employeeParams = [];
            

            employeeParams.push(employeeFName || 'null');
            employeeParams.push(employeeLName || 'null');

            db.run(employeeQuery, employeeParams, function(err){
                if(err){
                    db.run('ROLLBACK');
                    return res.status(500).json({error: 'error registering: ' + err.message});
                }
                employeeID = this.lastID;
            });

            const userQuery = `INSERT INTO Users (username, passwordHash, role, employeeID) VALUES (?,?,?,?)`;
            const userParams = [username, passwordHash, role || 'User', employeeID];

            db.run(userQuery, userParams, function(err){
                if(err){
                    db.run('ROLLBACK');
                    if(err.message.includes("UNIQUE constraint failed")){
                        return res.status(400).json({error:"Username already exists."})
                    }
                    return res.status(500).json({error: "Error adding user: " + err.message});
                }

                db.run("COMMIT", (err) => {
                    if(err){
                        return res.status(500).json({error: "Error committing transaction: " + err.message});
                    }
                    res.json({
                        message: "User registered successfully",
                        userID: this.lastID,
                        employeeID: employeeID
                    })
                });
            });


        });
    } catch (error) {
        res.status(500).json("Error hashing password.");
    }
    
});

//either a user or an admin can use this. The JWT will sign with their role though.
app.post('/api/login', (req, res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({error: "username and password required."});
    }

    const query = 'SELECT * FROM Users WHERE username = ?';
    db.get(query, [username], async (err, user) => {
        if(err){
            return res.status(500).json({message: err.message});
        }
        if(!user){
            return res.status(400).json({error: "Invalid username or password"});
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if(!passwordsMatch){
            return res.status(400).json({error: "Invalid username or password."});
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role},
            secretKey,
            {expiresIn: '90d'}
        );

        res.json({message: "Login Successful", token});
    })
});

//view all existing shifts, or search for shifts by employee. Admins only.
app.get('/api/shifts', authenticateAdmin, (req, res) => {
    const { employeeID } = req.query;

    // Base query for fetching shifts
    let query = `
        SELECT 
            Associative.shiftID,
            Employees.id AS employeeID,
            Employees.employeeFName,
            Employees.employeeLName,
            Shifts.shiftStartTime,
            Shifts.shiftEndTime,
            Shifts.clockInTime,
            Shifts.clockOutTime,
            Teams.id AS teamID,
            Teams.teamName
        FROM Associative
        JOIN Employees ON Employees.id = Associative.employeeID
        JOIN Shifts ON Shifts.id = Associative.shiftID
        LEFT JOIN Teams ON Teams.id = Associative.teamID
    `;

    const params = [];

    // Modify query to filter by employeeID if provided
    if (employeeID) {
        query += ` WHERE Employees.id = ?`;
        params.push(employeeID);
    }
    query += 'ORDER BY Shifts.shiftStartTime ASC'

    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

//endpoint for employees to view their shifts.
app.get('/api/my_shifts', authenticateToken, (req, res) => {
    const userId = req.user.userId;  // Get employee ID from token

    const query = `
        SELECT 
            Associative.shiftID,
            Employees.id AS employeeID,
            Employees.employeeFName,
            Employees.employeeLName,
            Shifts.shiftStartTime,
            Shifts.shiftEndTime,
            Shifts.clockInTime,
            Shifts.clockOutTime,
            Teams.id AS teamID,
            Teams.teamName
        FROM Associative
        JOIN Employees ON Employees.id = Associative.employeeID
        JOIN Shifts ON Shifts.id = Associative.shiftID
        LEFT JOIN Teams ON Teams.id = Associative.teamID
        WHERE Employees.id = ?
        ORDER BY Shifts.shiftStartTime ASC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});


//view all existing employees. admin only.
app.get('/api/employees', authenticateAdmin, (req, res) => {
    db.all('SELECT * FROM Employees', [], (err, rows) => {
    if (err) {
        res.status(400).json({ error: err.message });
        return;
    }
    res.json({ data: rows });
    });
});

//create a new employee in the database. admin access.
app.post('/api/employees', authenticateAdmin, (req, res) => {
    const { employeeFName, employeeLName } = req.body;
    const query = 'INSERT INTO Employees (employeeFName, employeeLName) VALUES (?,?)';
    const params = [employeeFName, employeeLName];

    db.run(query, params, function(err){
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'Employee added successfully',
            data: { id: this.lastID, employeeFName, employeeLName }
        });
    });
});

//create a new shift and link it in the Associative table. admin only.
app.post('/api/createShift', authenticateAdmin, (req, res) => {
    const { employeeID, shiftStartTime, shiftEndTime, clockInTime, clockOutTime, teamID } = req.body;

    // Validate that employeeID, shiftStartTime, and shiftEndTime are provided
    if (!employeeID || !shiftStartTime || !shiftEndTime) {
        res.status(400).json({ error: "employeeID, shiftStartTime, and shiftEndTime are required" });
        return;
    }

    // Insert the new shift into the Shifts table
    const insertShiftQuery = `
        INSERT INTO Shifts (shiftStartTime, shiftEndTime, clockInTime, clockOutTime) 
        VALUES (?, ?, ?, ?)
    `;
    const shiftParams = [shiftStartTime, shiftEndTime, clockInTime || null, clockOutTime || null];

    db.run(insertShiftQuery, shiftParams, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        // Get the new shiftID of the inserted shift
        const newShiftID = this.lastID;

        // Insert into Associative table
        const assignShiftQuery = `
            INSERT INTO Associative (shiftID, employeeID, teamID) 
            VALUES (?, ?, ?)
        `;
        const assignParams = [newShiftID, employeeID, teamID || null];

        db.run(assignShiftQuery, assignParams, function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }

            res.json({
                message: 'Shift created and assigned successfully',
                data: {
                    shiftID: newShiftID,
                    employeeID,
                    teamID: teamID || null,
                    shiftStartTime,
                    shiftEndTime,
                    clockInTime: clockInTime || null,
                    clockOutTime: clockOutTime || null
                }
            });
        });
    });
});

//Update an existing shift. admin only.
app.put('/api/shifts/:shiftID', authenticateAdmin, (req, res) => {
    const { shiftID } = req.params;
    const { shiftStartTime, shiftEndTime, clockInTime, clockOutTime } = req.body;

    // Check if at least one field is provided
    if (!shiftStartTime && !shiftEndTime && !clockInTime && !clockOutTime) {
        res.status(400).json({ error: "At least one field is required to update the shift" });
        return;
    }

    // Build the SQL query dynamically based on provided fields
    const fields = [];
    const params = [];

    if (shiftStartTime) {
        fields.push("shiftStartTime = ?");
        params.push(shiftStartTime);
    }
    if (shiftEndTime) {
        fields.push("shiftEndTime = ?");
        params.push(shiftEndTime);
    }
    if (clockInTime) {
        fields.push("clockInTime = ?");
        params.push(clockInTime);
    }
    if (clockOutTime) {
        fields.push("clockOutTime = ?");
        params.push(clockOutTime);
    }
    params.push(shiftID);

    const query = `UPDATE Shifts SET ${fields.join(", ")} WHERE id = ?`;

    db.run(query, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: "Shift not found or no change in data" });
        } else {
            res.json({ message: "Shift updated successfully" });
        }
    });
});


//Update an existing Employee. Admin access.
app.put('/api/employees/:employeeID', authenticateAdmin, (req, res) => {
    const { employeeID } = req.params;
    const { employeeFName, employeeLName } = req.body;

    // Check if at least one field is provided
    if (!employeeFName && !employeeLName) {
        res.status(400).json({ error: "At least one field is required to update an employee's information" });
        return;
    }

    // Build the SQL query dynamically based on provided fields
    const fields = [];
    const params = [];

    if (employeeFName) {
        fields.push("employeeFName= ?");
        params.push(employeeFName);
    }
    if (employeeLName) {
        fields.push("employeeLName = ?");
        params.push(employeeLName);
    }
    params.push(employeeID);

    const query = `UPDATE Employees SET ${fields.join(", ")} WHERE id = ?`;

    db.run(query, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: "Employee not found or no change in data" });
        } else {
            res.json({ 
                message: "Employee updated successfully", 
                data: { id: this.lastID, employeeFName, employeeLName }
            });
        }
    });
});

//Remove a shift. Admin Access.
app.delete('/api/deleteShift', authenticateAdmin, (req, res) => {
    const { shiftID } = req.body;

    // Validate that shiftID was provided
    if (!shiftID) {
        res.status(400).json({ error: "shiftID is required to delete a shift" });
        return;
    }

    const deleteShiftQueryAssociative = `DELETE FROM Associative WHERE shiftId = ? `; 
    const associativeParams = [];
    associativeParams.push(shiftID);

    db.run(deleteShiftQueryAssociative, associativeParams, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        const associativeChanges = this.changes;

        const deleteShiftQueryShifts = `DELETE FROM Shifts WHERE id = ?`;
        const shiftsParams = [];
        shiftsParams.push(shiftID);

        db.run(deleteShiftQueryShifts, shiftsParams, function (err) {
            const shiftsChanges = this.changes;

            if (associativeChanges === 0 && shiftsChanges === 0) {
                res.status(404).json({ error: "Shift not found or no change in data" });
            } else {
                res.json({ 
                    message: "Shift DELETED successfully", 
                    data: {
                        DeletedShiftID : shiftID,
                        numberDeletesAssociativeTable : associativeChanges,
                        numberDeletesShiftsTable : shiftsChanges
                    }
                });
            }
        });
    });   
});

//delete an employee from db. Admin access.
app.delete('/api/deleteEmployee', authenticateAdmin, (req, res) => {
    const { employeeID } = req.body;

    // Validate that shiftID was provided
    if (!employeeID) {
        res.status(400).json({ error: "EmployeeID is required to remove an Employee." });
        return;
    }

    db.serialize(() => {
        //The shift entries for the employee will also be deleted from the Associative Table and the Shifts Table.
        //This gets that info for later.
        //STEP 1: get needed shiftIDs
        const getShiftIDsQuery = `SELECT shiftID FROM Associative WHERE employeeID = ?`;

        db.all(getShiftIDsQuery, [employeeID], (err, rows) => {
            if (err) {
                res.status(400).json({ error : err.message });
                return;
            }

            const shiftIDs = rows.map(row => row.shiftID);

            //apparently enforces that all of the deletions happen, or none do.
            db.run("BEGIN TRANSACTION");

            //STEP 2: Delete from Associative
            const deleteAssociativeQuery = `DELETE FROM Associative WHERE employeeID = ?`;
            db.run(deleteAssociativeQuery, [employeeID], function (err) {
                if(err) {
                    db.run("ROLLBACK"); //this is a part of everything being a part of a transaction: stops all deletes if there is an error anywhere.
                    res.status(400).json({ error : err.message });
                    return;
                }
                
                const numberDeletedShifts = this.changes;

                //STEP 3: Delete from the shifts table all of the shifts that belong to the employee being deleted.
                //If no shifts are associated, skip deleting the shifts from the shifts Table
                if(shiftIDs.length > 0) {
                    const deleteShiftsQuery = `DELETE FROM Shifts WHERE id IN (${shiftIDs.map(() => '?').join(',')})`;

                    db.run(deleteShiftsQuery, shiftIDs, function(err) {
                        if(err) {
                            db.run("ROLLBACK");
                            res.status(400).json({error : err.message});
                            return;
                        }

                        //STEP 4: Finally, delete the record from the Employees Table
                        const deleteEmployeeQuery = `DELETE FROM Employees WHERE id = ?`;
                        db.run(deleteEmployeeQuery, [employeeID], function(err){
                            if (err) {
                                db.run("ROLLBACK");
                                res.status(400).json({ error : err.message });
                                return;
                            }
                            const employeeTableDeletes = this.changes;

                            //commit the transaction if all of the deletions succedd without errors.
                            db.run("COMMIT");

                            if (employeeTableDeletes === 0) {
                                res.status(404).json({ error: "Employee not found or no change in data" });
                            } else {
                                res.json({
                                    message : "Employee and associated shifts DELETED Successfully.",
                                    data : {
                                        DeletedEmployeeID : employeeID,
                                        DeletedShiftIDs : shiftIDs,
                                        numberDeletedShifts : numberDeletedShifts
                                    } 
                                });
                            }
                        });
                    });
                } else {
                    //employee had no associated shifts
                    const deleteEmployeeQuery = `DELETE FROM Employees WHERE id = ?`;
                    db.run(deleteEmployeeQuery, [employeeID], function (err) {
                        if(err) {
                            db.run("ROLLBACK");
                            res.status(400).json({error: err.message});
                            return;
                        }
                        const employeeTableDeletes = this.changes;

                        db.run("COMMIT");
                        if (employeeTableDeletes === 0) {
                            res.status(404).json({ error: "Employee not found or no change in data" });
                        } else {
                            res.json({
                                message : "Employee DELETED successfully (No associated shifts found)",
                                data : {
                                    DeletedEmployeeID : employeeID,
                                    DeletedShiftIDs : [],
                                    numberDeletedShifts : 0
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    /*
    const deleteEmployeeQuery = `DELETE FROM Employees WHERE id = ? `; 
    const params = [];
    params.push(employeeID);

    db.run(deleteEmployeeQuery, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const employeeTableDeletes = this.changes;
        if (employeeTableDeletes === 0) {
            res.status(404).json({ error: "Employee not found or no change in data" });
        } else {
            res.json({ 
                message: "Employee DELETED successfully", 
                data: {
                    DeletedEmployeeID : employeeID,
                    numberDeletes : this.changes
                }
            });
        }
    });  
    */ 
});



app.post('/api/verifyUser', (req, res) => {
    const token = req.body.token;

    if(!token){
        return res.status(400).json({error: 'token is required.'});
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        res.json({valid: true, user: decoded});
    } catch (err){
        res.status(401).json({valid: false, error: "Invalid or expired token."});
    }
});


// Start the server
if(process.env.NODE_ENV !== 'test') { //server instance should not be run while testing as it can apparently interfere with testing
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app; //needed for testing with Jest