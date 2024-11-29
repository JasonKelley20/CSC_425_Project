const request = require('supertest');
const app = require('../index.js');

//tests for the /api/employees endpoint (GET and POST)
describe('Employee API Tests', () => {
    let token;

    beforeAll(async () => {
        // login to get admin credentials for authentication
        const response = await request(app).post('/api/login').send({
        username: 'jsmith',
        password: 'Password123',
        });
        token = response.body.token;
    });

    test('GET /api/employees - Should fetch all employees (Admin Access)', async () => {
        const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${token}`); // Include token in the header

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
    });

    test('GET /api/employees - Should return 401 if no authorization is provided', async () => {
        const response = await request(app).get('/api/employees');
    
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
      });


    test('POST /api/employees - Should create a new employee with valid authorization', async () => {
        const response = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${token}`)
            .send({
            employeeFName: 'Jane',
            employeeLName: 'Doe',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Employee added successfully');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.employeeFName).toBe('Jane');
        expect(response.body.data.employeeLName).toBe('Doe');
    });

    test('POST /api/employees - Should return 401 if unauthorized', async () => {
        const response = await request(app).post('/api/employees').send({
        name: 'John Doe',
        });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
    });
});



// api/createShift
describe('Create Shift API Tests', () => {
    let adminToken;
    let userToken;
  
    beforeAll(async () => {
      // Admin login to get admin credentials
      const adminResponse = await request(app).post('/api/login').send({
        username: 'jsmith', 
        password: 'Password123',
      });
      adminToken = adminResponse.body.token;
  
      // User login to get user credentials
      const userResponse = await request(app).post('/api/login').send({
        username: 'dsmith', 
        password: 'Password123',
      });
      userToken = userResponse.body.token;
    });
  
    test('POST /api/createShift - Should create a shift with admin access and all fields provided', async () => {
        const response = await request(app)
            .post('/api/createShift')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            employeeID: 1,
            shiftStartTime: '2024-11-05 08:00:00',
            shiftEndTime: '2024-11-05 16:00:00',
            clockInTime: '2024-11-05 08:05:00',
            clockOutTime: null,
            teamID: 3,  // Optional
        });

        expect(response.status).toBe(200);  // Shift created successfully
        expect(response.body).toHaveProperty('message', 'Shift created and assigned successfully');
        expect(response.body.data).toHaveProperty('shiftID');
        expect(response.body.data).toHaveProperty('employeeID', 1);
        expect(response.body.data).toHaveProperty('teamID', 3);
        expect(response.body.data).toHaveProperty('shiftStartTime', '2024-11-05 08:00:00');
        expect(response.body.data).toHaveProperty('shiftEndTime', '2024-11-05 16:00:00');
        expect(response.body.data).toHaveProperty('clockInTime', '2024-11-05 08:05:00');
        expect(response.body.data).toHaveProperty('clockOutTime', null);
    });
  
    test('POST /api/createShift - Should return 401 if user access is provided', async () => {
        const response = await request(app)
        .post('/api/createShift')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            employeeID: 1,
            shiftStartTime: '2024-11-05 08:00:00',
            shiftEndTime: '2024-11-05 16:00:00',
            clockInTime: '2024-11-05 08:05:00',
            clockOutTime: null,
            teamID: 3,
        });
    
        expect(response.status).toBe(403);  // Unauthorized
        expect(response.body.error).toBe("Admin privileges required.");
    });
  
    test('POST /api/createShift - Should return 400 if no fields are provided', async () => {
        const response = await request(app)
        .post('/api/createShift')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});  // Sending no data with request
    
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("employeeID, shiftStartTime, and shiftEndTime are required");
    });
});





// api/register
describe('Register API Tests', () => {
    let adminToken;

    beforeAll(async () => {
        // Admin login to get admin credentials
        const adminResponse = await request(app).post('/api/login').send({
            username: 'jsmith',  // admin credentials
            password: 'Password123',
        });
        adminToken = adminResponse.body.token;
    });

    // Test for registering a new admin
    test('POST /api/register - Should register an admin account with admin access', async () => {
        const response = await request(app)
            .post('/api/register')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                username: 'jsmith12',
                password: 'Password123',
                employeeFName: 'Jack',
                employeeLName: 'Smith',
                role: 'Admin',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User registered successfully');
        expect(response.body).toHaveProperty('userID');
        expect(response.body).toHaveProperty('employeeID');
    });

    // Test for registering a standard user (no admin authentication required)
    test('POST /api/register - Should register a user account without authentication', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                username: 'jdoe',
                password: 'Password123',
                employeeFName: 'John',
                employeeLName: 'Doe',
                role: 'User',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User registered successfully');
        expect(response.body).toHaveProperty('userID');
        expect(response.body).toHaveProperty('employeeID');
    });

    // Test for registering a user without a role (should be treated as standard user)
    test('POST /api/register - Should treat a user without a role as a standard user', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                username: 'jane.doe',
                password: 'Password123',
                employeeFName: 'Jane',
                employeeLName: 'Doe',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User registered successfully');
        expect(response.body).toHaveProperty('userID');
        expect(response.body).toHaveProperty('employeeID');
    });

    // Test for registering a user with invalid role (should return an error)
    test('POST /api/register - Should return an error if invalid role is provided', async () => {
        const response = await request(app)
            .post('/api/register')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                username: 'invalidroleuser',
                password: 'Password123',
                employeeFName: 'Invalid',
                employeeLName: 'Role',
                role: 'UserAdmin',  // Invalid role
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("role not acceptable");
    });
});




// api/login
describe('Login API Tests', () => {
    // Test for successful login
    test('POST /api/login - Should log in successfully with valid credentials', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                username: 'jsmith',
                password: 'Password123',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login Successful');
        expect(response.body).toHaveProperty('token');
        expect(typeof response.body.token).toBe('string');  // Ensure the token is a string
    });

    // Test for invalid credentials (wrong password)
    test('POST /api/login - Should return 400 with invalid password', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                username: 'jsmith',
                password: 'WrongPassword',
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid username or password.");
    });

    // Test for missing username
    test('POST /api/login - Should return 400 if username is missing', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                password: 'Password123',
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("username and password required.");
    });

    // Test for missing password
    test('POST /api/login - Should return 400 if password is missing', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                username: 'jsmith',
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("username and password required.");
    });

    // Test for non-existent user
    test('POST /api/login - Should return 400 if username does not exist', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                username: 'nonexistentuser',
                password: 'Password123',
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid username or password");
    });
});



// api/verifyUser endpoint
describe('Verify User API Tests', () => {
    let validToken;
    let invalidToken = "invalidToken";
  
    beforeAll(async () => {
        // Admin login to get a valid token
        const adminResponse = await request(app).post('/api/login').send({
            username: 'jsmith', 
            password: 'Password123',
        });
        validToken = adminResponse.body.token;
    });
  
    // Test for verifying a valid token
    test('POST /api/verifyUser - Should return user data for a valid token', async () => {
        const response = await request(app)
            .post('/api/verifyUser')
            .send({
            token: validToken
            });
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('valid', true);
        expect(response.body.user).toHaveProperty('userId');
        expect(response.body.user).toHaveProperty('role');
        expect(response.body.user).toHaveProperty('iat');
    });
  
    // Test for verifying an invalid token
    test('POST /api/verifyUser - Should return error for an invalid or expired token', async () => {
        const response = await request(app)
            .post('/api/verifyUser')
            .send({
            token: invalidToken
            });
  
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('valid', false);
        expect(response.body).toHaveProperty('error', 'Invalid or expired token.');
    });
  });



// api/shifts endpoint (viewAllShifts)
describe('View All Shifts API Tests', () => {
    let adminToken;
    let nonAdminToken;
  
    beforeAll(async () => {
        // Admin login to get admin token
        const adminResponse = await request(app).post('/api/login').send({
            username: 'jsmith', 
            password: 'Password123',
        });
        adminToken = adminResponse.body.token;
    
        // Non-admin login to get non-admin token
        const nonAdminResponse = await request(app).post('/api/login').send({
            username: 'jdoe', 
            password: 'Password123',
        });
        nonAdminToken = nonAdminResponse.body.token;
    });
  
    // Test for admin successfully retrieving all shifts
    test('GET /api/shifts - Should return all shifts for admin user', async () => {
        const response = await request(app)
            .get('/api/shifts')
            .set('Authorization', `Bearer ${adminToken}`);
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('shiftID');
        expect(response.body.data[0]).toHaveProperty('employeeID');
        expect(response.body.data[0]).toHaveProperty('teamName');
    });
  
    // Test for non-admin trying to retrieve all shifts (should be denied)
    test('GET /api/shifts - Should deny access for non-admin user', async () => {
        const response = await request(app)
            .get('/api/shifts')
            .set('Authorization', `Bearer ${nonAdminToken}`);
    
        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Admin privileges required.");
    });
  
    // Test for when no token is provided (should be denied)
    test('GET /api/shifts - Should deny access if no token is provided', async () => {
        const response = await request(app)
            .get('/api/shifts');
    
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
    });
});



// api/shifts/:employeeID endpoint (view shifts for a single employee)
describe('View Employee Shifts API Tests', () => {
    let adminToken;
    let nonAdminToken;

    beforeAll(async () => {
        // Admin login to get admin token
        const adminResponse = await request(app).post('/api/login').send({
            username: 'jsmith', 
            password: 'Password123',
        });
        adminToken = adminResponse.body.token;
    
        // Non-admin login to get non-admin token
        const nonAdminResponse = await request(app).post('/api/login').send({
            username: 'jdoe', 
            password: 'Password123',
        });
        nonAdminToken = nonAdminResponse.body.token;
    });
  
    // Test for admin successfully retrieving employee's shifts
    test('GET /api/shifts?employeeID=1 - Should return shifts for the specified employee for admin user', async () => {
        const response = await request(app)
            .get('/api/shifts?employeeID=1')
            .set('Authorization', `Bearer ${adminToken}`);
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('shiftID');
        expect(response.body.data[0]).toHaveProperty('employeeID');
        expect(response.body.data[0]).toHaveProperty('employeeFName');
        expect(response.body.data[0]).toHaveProperty('teamName');
    });
  
    // Test for non-admin trying to retrieve shifts for a specific employee (should be denied)
    test('GET /api/shifts?employeeID=1 - Should deny access for non-admin user', async () => {
        const response = await request(app)
            .get('/api/shifts?employeeID=1')
            .set('Authorization', `Bearer ${nonAdminToken}`);
    
        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Admin privileges required.");
    });
  
    // Test for when no token is provided (should be denied)
    test('GET /api/shifts?employeeID=1 - Should deny access if no token is provided', async () => {
        const response = await request(app)
            .get('/api/shifts?employeeID=1');
    
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
    });

    // Test for invalid employeeID (should return empty data or error message)
    test('GET /api/shifts?employeeID=9999 - Should return empty data for invalid employeeID', async () => {
        const response = await request(app)
            .get('/api/shifts?employeeID=9999')
            .set('Authorization', `Bearer ${adminToken}`);
    
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]); // No shifts for non-existing employee
    });
});


// api/my_shifts endpoint (viewMyShifts)
describe('View My Shifts API Tests', () => {
    let adminToken;
    let userToken;

    beforeAll(async () => {
        // Admin login to get admin token
        const adminResponse = await request(app).post('/api/login').send({
            username: 'jsmith', 
            password: 'Password123',
        });
        adminToken = adminResponse.body.token;
    
        // User login to get user token
        const userResponse = await request(app).post('/api/login').send({
            username: 'dsmith', 
            password: 'Password123',
        });
        userToken = userResponse.body.token;
    });

    // Test for admin successfully retrieving their own shifts
    test('GET /api/my_shifts - Admin should be able to view their shifts', async () => {
        const response = await request(app)
            .get('/api/my_shifts')
            .set('Authorization', `Bearer ${adminToken}`);
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('shiftID');
        expect(response.body.data[0]).toHaveProperty('employeeID');
        expect(response.body.data[0]).toHaveProperty('employeeFName');
        expect(response.body.data[0]).toHaveProperty('teamName');
    });

    // Test for user successfully retrieving their own shifts
    test('GET /api/my_shifts - User should be able to view their shifts', async () => {
        const response = await request(app)
            .get('/api/my_shifts')
            .set('Authorization', `Bearer ${userToken}`);
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('shiftID');
        expect(response.body.data[0]).toHaveProperty('employeeID');
        expect(response.body.data[0]).toHaveProperty('employeeFName');
        expect(response.body.data[0]).toHaveProperty('teamName');
    });

    // Test for when no token is provided (should be denied)
    test('GET /api/my_shifts - Should deny access if no token is provided', async () => {
        const response = await request(app)
            .get('/api/my_shifts');
    
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
    });

    // Test for invalid token (should be denied)
    test('GET /api/my_shifts - Should deny access with invalid token', async () => {
        const response = await request(app)
            .get('/api/my_shifts')
            .set('Authorization', 'Bearer invalidtoken');
    
        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Token is invalid or expired.");
    });
});



// api/shifts/:shiftID
describe('PUT /api/shifts/:shiftID', () => {
    let adminToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                username: 'jsmith',
                password: 'Password123'
            });

        adminToken = loginResponse.body.token; 
    });

    it('should return 200 and success message when at least one valid field is provided', async () => {
        const shiftID = 1;
        const data = {
            shiftStartTime: "2024-11-06 09:00:00",
            clockInTime: "2024-11-06 09:05:00"
        };

        const response = await request(app)
            .put(`/api/shifts/${shiftID}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(data);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Shift updated successfully");
    });

    it('should return 400 when no valid fields are provided', async () => {
        const shiftID = 1;
        const data = {}; 

        const response = await request(app)
            .put(`/api/shifts/${shiftID}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(data);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("At least one field is required to update the shift");
    });

    it('should return 401 when no authorization token is provided', async () => {
        const shiftID = 1;
        const data = {
            shiftStartTime: "2024-11-06 09:00:00"
        };

        const response = await request(app)
            .put(`/api/shifts/${shiftID}`)
            .send(data);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
    });

    it('should return 403 when non-admin attempts to update a shift', async () => {
        const shiftID = 1;
        const data = {
            shiftStartTime: "2024-11-06 09:00:00"
        };

        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                username: 'dsmith', 
                password: 'Password123'
            });

        const userToken = loginResponse.body.token;

        const response = await request(app)
            .put(`/api/shifts/${shiftID}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(data);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Admin privileges required.");
    });
});



// api/employees/:employeeID (Update an Employee)
describe('PUT /api/employees/:employeeID', () => {
    let adminToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                username: 'jsmith',
                password: 'Password123'
            });

        adminToken = loginResponse.body.token; 
    });

    it('should return 200 and success message when valid data is provided', async () => {
        const employeeID = 1;
        const data = {
            employeeLName: "Postman"
        };

        const response = await request(app)
            .put(`/api/employees/${employeeID}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(data);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Employee updated successfully");
        expect(response.body.data.employeeLName).toBe("Postman");
    });

    it('should return 400 when no valid fields are provided', async () => {
        const employeeID = 1;
        const data = {}; 

        const response = await request(app)
            .put(`/api/employees/${employeeID}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(data);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("At least one field is required to update an employee's information");
    });

    it('should return 401 when no authorization token is provided', async () => {
        const employeeID = 1;
        const data = {
            employeeLName: "Postman"
        };

        const response = await request(app)
            .put(`/api/employees/${employeeID}`)
            .send(data);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
    });

    it('should return 403 when non-admin attempts to update an employee', async () => {
        const employeeID = 1;
        const data = {
            employeeLName: "Postman"
        };

        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                username: 'dsmith',  // Non-admin user
                password: 'Password123'
            });

        const userToken = loginResponse.body.token;

        const response = await request(app)
            .put(`/api/employees/${employeeID}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(data);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Admin privileges required.");
    });
});


// api/deleteShift
describe('DELETE /api/deleteShift', () => {
    let adminToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                username: 'jsmith',
                password: 'Password123'
            });

        adminToken = loginResponse.body.token; 
    });

    it('should return 200 and success message when a shift is successfully deleted', async () => {
        const shiftID = 1;
        const response = await request(app)
            .delete('/api/deleteShift')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ shiftID });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Shift DELETED successfully");
        expect(response.body.data.DeletedShiftID).toBe(shiftID);
        expect(response.body.data.numberDeletesAssociativeTable).toBe(1);
        expect(response.body.data.numberDeletesShiftsTable).toBe(1);
    });

    it('should return 401 when no authorization token is provided', async () => {
        const shiftID = 1;
        const response = await request(app)
            .delete('/api/deleteShift')
            .send({ shiftID });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
    });

    it('should return 403 when non-admin attempts to delete a shift', async () => {
        const shiftID = 1;
        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                username: 'dsmith',  // Non-admin user
                password: 'Password123'
            });

        const userToken = loginResponse.body.token;

        const response = await request(app)
            .delete('/api/deleteShift')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ shiftID });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Admin privileges required.");
    });

    it('should return 404 when trying to delete a non-existent shift', async () => {
        const shiftID = 9999;
        const response = await request(app)
            .delete('/api/deleteShift')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ shiftID });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Shift not found or no change in data");
    });
});


// api/deleteEmployee
describe('DELETE /api/deleteEmployee', () => {
    let adminToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                username: 'jsmith',
                password: 'Password123'
            });

        adminToken = loginResponse.body.token; 
    });

    it('should return 200 and success message when an employee and associated shifts are deleted', async () => {
        const employeeID = 7;
        const data = { employeeID };

        const response = await request(app)
            .delete('/api/deleteEmployee')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(data);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Employee and associated shifts DELETED Successfully.");
        expect(response.body.data.DeletedEmployeeID).toBe(employeeID);
        expect(response.body.data.DeletedShiftIDs).toBeInstanceOf(Array);
        expect(response.body.data.DeletedShiftIDs.length).toBeGreaterThanOrEqual(0);
        expect(response.body.data.numberDeletedShifts).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 when no employeeID is provided', async () => {
        const data = {}; // Missing employeeID

        const response = await request(app)
            .delete('/api/deleteEmployee')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(data);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("EmployeeID is required to remove an Employee.");
    });

    it('should return 401 when no authorization token is provided', async () => {
        const data = { employeeID: 7 };

        const response = await request(app)
            .delete('/api/deleteEmployee')
            .send(data);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access token is missing or invalid.");
    });

    it('should return 403 when non-admin attempts to delete an employee', async () => {
        const employeeID = 7;
        const data = { employeeID };

        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                username: 'dsmith', 
                password: 'Password123'
            });

        const userToken = loginResponse.body.token;

        const response = await request(app)
            .delete('/api/deleteEmployee')
            .set('Authorization', `Bearer ${userToken}`)
            .send(data);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Admin privileges required.");
    });

    it('should return 404 when trying to delete a non-existent employee', async () => {
        const data = { employeeID: 999 };

        const response = await request(app)
            .delete('/api/deleteEmployee')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(data);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Employee not found or no change in data");
    });
});