
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydb.sqlite');

async function createTables(){
    db.serialize(() => {
        //Create the tables: Employees, Admins, Shifts, Teams, and the Associative Entity EmployeeTeamShiftAssociative
        db.run(`CREATE TABLE IF NOT EXISTS Employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            employeeFName TEXT,
            employeeLName TEXT 
            )`, (err) => {
            if (err) {
                console.error('Error creating Employees table:', err.message);
            } else {
                console.log('Employees table created successfully');
            }
            });

        db.run(`CREATE
            TABLE IF NOT EXISTS Admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            adminLoginName TEXT,
            employeeID INTEGER,
            FOREIGN KEY (employeeID) REFERENCES Employees(id) 
            )`, (err) => {
            if (err) {
                console.error('Error creating Admins table:', err.message);
            } else {
                console.log('Admins table created successfully');
            }
            });

        //sqlite3 has no datetime type, but has functions for them. stored as TEXT in format 'YYYY-MM-DD HH:MM:SS'
        db.run(`CREATE TABLE IF NOT EXISTS Shifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            shiftStartTime TEXT,
            shiftEndTime TEXT,
            clockInTime TEXT,
            clockOutTime TEXT
            )`, (err) => {
            if (err) {
                console.error('Error creating Shifts table:', err.message);
            } else {
                console.log('Shifts table created successfully');
            }
            });

        db.run(`CREATE TABLE IF NOT EXISTS Teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            teamName TEXT
            )`, (err) => {
            if (err) {
                console.error('Error creating Teams table:', err.message);
            } else {
                console.log('Teams table created successfully');
            }
            });

        db.run(`CREATE TABLE IF NOT EXISTS EmployeeTeamShiftAssociative (
            shiftID INTEGER PRIMARY KEY NOT NULL, 
            employeeID INTEGER NOT NULL,
            teamID INTEGER,
            FOREIGN KEY (shiftID) REFERENCES Shifts(id),
            FOREIGN KEY (employeeID) REFERENCES Employees(id),
            FOREIGN KEY (teamID) REFERENCES Teams(id)
            )`, (err) => {
            if (err) {
                console.error('Error creating EmployeeTeamShiftAssociative table:', err.message);
            } else {
                console.log('EmployeeTeamShiftAssociative table created successfully');
            }
            });
                        
            
        // Insert samples     
        db.run(`INSERT INTO Employees (employeeFName, employeeLName) VALUES 
            ('John', 'Smith'),
            ('David', 'Smith'),
            ('Alice', 'Johnson'),
            ('Bob', 'Brown'),
            ('Jackson','Abrams'),
            ('Robert','Cope'),
            ('Samantha','Davidson')
        `);
        db.run(`INSERT INTO Admins (adminLoginName, employeeID) VALUES 
            ('ADMIN Smith', 1),
            ('Admin Abrams', 5)
        `);
        db.run(`INSERT INTO Teams (teamName) VALUES 
            ('Team 1'),
            ('Team 2'),
            ('Team 3'),
            ('Team 4'),
            ('Team 5')
        `);
        db.run(`INSERT INTO Shifts (shiftStartTime, shiftEndTime, clockInTime, clockOutTime) VALUES 
            ('2024-10-31 08:00:00', '2024-10-31 16:00:00', '2024-10-31 08:01:23', ''),
            ('2024-10-31 08:00:00', '2024-10-31 16:00:00', '2024-10-31 07:58:43', ''),
            ('2025-12-01 12:00:00', '2025-12-01 16:00:00', '', ''),
            ('2025-01-03 11:00:00', '2024-10-31 23:00:00', '', ''),
            ('2024-10-15 08:00:00', '2024-10-15 18:00:00', '2024-10-15 07:59:23', '2024-10-15 18:09:33'),
            ('2024-10-31 08:00:00', '2024-10-31 16:00:00', '', ''),
            ('2024-08-18 08:30:00', '2024-08-18 20:30:00', '2024-08-18 08:30:01', '2024-08-18 20:30:07'),
            ('2024-09-31 06:00:00', '2024-09-31 18:00:00', '', ''),
            ('2024-11-01 08:00:00', '2024-11-01 16:00:00', '2024-11-01 08:00:00', ''),
            ('2024-12-31 05:30:00', '2024-12-31 12:30:00', '', ''),
            ('2024-07-13 08:00:00', '2024-07-13 16:00:00', '2024-07-13 08:03:23', '2024-07-13 16:04:52'),
            ('2024-10-31 08:00:00', '2024-10-31 16:00:00', '', ''),
            ('2024-10-31 08:00:00', '2024-10-31 16:00:00', '2024-10-31 08:00:00', ''),
            ('2024-10-31 08:00:00', '2024-10-31 16:00:00', '', ''),
            ('2024-10-31 08:00:00', '2024-10-31 16:00:00', '2024-10-31 08:01:00', '2024-10-31 16:02:32'),
            ('2024-10-24 08:30:00', '2024-10-24 16:30:00', '', '')
        `);
        db.run(`INSERT INTO EmployeeTeamShiftAssociative (shiftID, employeeID, teamID) VALUES 
            (1,1,1),
            (2,2,2),
            (3,3,4),
            (4,4,5),
            (5,5,3),
            (6,6,1),
            (7,7,1),
            (8,1,2),
            (9,2,3),
            (10,7,5),
            (11,1,5),
            (12,6,3),
            (13,1,3),
            (14,1,2),
            (15,5,5),
            (16,4,4)
        `);
        
    });

    db.close();

    await new Promise(resolve => setTimeout(resolve, 1000));
}

module.exports = { createTables };
