const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];


const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;

  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin authentication failed' });
  }
};

const userAuthentication  = (req, res, next) => {
  const { username,password } = req.headers;
  
  const user = USERS.find(a => a.username === username && a.password === password );
  if(user){
    req.user = user;
    next();
  }
  else{
    return res.status(403).json({message : "User authentication failed"});
  }

}



// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const username = req.bosy.username;
  const password  = req.body.password;

  for(admin of ADMINS){
    if(admin.username === username){
      res.status(403).json({message: "Username already exists"})
    }
  }
  ADMINS.push({username, password});
  return res.status(201).json({message: "Admin created successfully"});

});

app.post('/admin/login', adminAuthentication, (req, res) => {
  // logic to log in admin
  return res.status(403).json({message: "Admin authentication failed"});
});

app.post('/admin/courses', adminAuthentication, (req, res) => {
  // logic to create a course
  const course = req.body;
  course.id = Date.now();

  COURSES.push(course);
  return res.status(201).json({message: "Course created successfully", courseId: course.id});
});

app.put('/admin/courses/:courseId', adminAuthentication, (req, res) => {
  // logic to edit a course
  const courseId = req.params.courseId;
  const course = COURSES.find(c => c.id === courseId);
  if(course){
    Object.assign(course, req.body);
    return res.status(200).json({message: "Course updated successfully"});
  }
  return res.status(404).json({message: "Course not found"});
});

app.get('/admin/courses', adminAuthentication, (req, res) => {
  // logic to get all courses
  return res.status(200).json({courses : COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = {
    username: req.body.username,
    password: req.body.password,
    purchasedCourses: []
  }
  USERS.push(user);
  res.json({ message: 'User created successfully' });


});

app.post('/users/login', userAuthentication, (req, res) => {
  // logic to log in user
  return res.status(200).json({message: "User logged in successfully"});
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
  let filteredCourses = [];
  for (let i = 0; i<COURSES.length; i++) {
    if (COURSES[i].published) {
      filteredCourses.push(COURSES[i]);
    }
  }
  res.json({ courses: filteredCourses });
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  const courseId = req.params.courseId;
  const course = COURSES.find(c => c.id === courseId);
  if(course){
    req.user.purchasedCourses.push(course);
    return res.status(200).json({message: "Course purchased successfully"});
  }
  return res.status(404).json({message: "Course not found"});


});

app.get('/users/purchasedCourses',  (req, res) => {
  // logic to view purchased courses
  var purchasedCourseIds = req.user.purchasedCourses; 
  var purchasedCourses = [];
  for (let i = 0; i<COURSES.length; i++) {
    if (purchasedCourseIds.indexOf(COURSES[i].id) !== -1) {
      purchasedCourses.push(COURSES[i]);
    }
  }

  res.json({ purchasedCourses });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
