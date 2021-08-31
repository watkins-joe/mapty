// LECTURE: How to Plan a Web Project

// Project Planning

// important to start with planning phase prior to new project

// process that works great with small or medium sized projects

// 1.) User stories

// A description of the application's functionality from the USER'S PERSPECTIVE. ALl user stories put together describe the entire application.

// 2.) Features

// 3.) Flowchart

// What we will build

// 4.) Architecture

// HOW we will built it

// The first four steps altogether are the PLANNING STEP

// The DEVELOPMENT step follows the planning step
// this is the IMPLEMENTATION of our plan using code

// IN DETAILS:

// 1.) USER STORIES //

// User story: Description of the application's functionaility from the user's perspective.

// Common format: As a [type of user], I want [an action] so that [a benefit]
// this helps answer 'who', 'what', and 'why'.

// example:
// 1.) As a user, I want to LOG MY RUNNING WORKOUTS WITH LOCATION, DISTANCE, TIME, PACE, AND STEPS/MINUTE, so I can keep a log of all my running.

// 2.) As a user, I want to LOG MY CYCLING WORKOUTS WITH LOCATION, DISTANCE, TIME, SPEED AND ELEVATION GAIN, so I can keep a log of all my cycling.

// 3.) As a user, I want to SEE ALL MY WORKOUTS AT A GLANCE, so I can easily track my progress over time

// 4.) As a user, I want to ALSO SEE MY WORKOUTS ON A MAP, so I can easily check where I work out the most

// 5.) As a user, I want to SEE ALL MY WORKOUTS WHEN I LEAVE THE APP AND COME BACK LATER, so that I can keep using the app over time

// 2.) FEATURES //

// from user story 1:
// Map where user can click to add new workout (best way to get location coordinates)

// Geolocation to display map at current location (more user friendly)

// Form to input distance, time, pace, steps/minute (aka cadence)

// from user story 2:
// Form to input distance, time, speed, elevation gain

// from user story 3:
// Display all workouts in a list

// from user story 4:
// Display all workouts on the map

// from user story 5:
// Store workout data in the browser using local storage API

// On page load, read the saved data from local storage and display

// 8.) load workouts from local storage

// Building flow chart
// good to begin with events, like beginning with a 'Page loads' event

// in order of flow:
// 1.) get current location coords (async)
// 2.) render map on current location

// ... bind handler ...

// user clicks on map

// 3.) and 4.) render workout form.

// in the real world, you don't have to come with the final flowchart right in the planning phase. it's normal that it changes throughout implementation.

// continuing --

// ... bind handler ...

// user submits new workout

// 5. render workout on map

// 6. render workout in list

// 7. store workouts in local storage (many)

// see Mapty-flowchart.png, and lecture 228.

// 4.) ARCHITECTURE

// don't always need the perfect architecture figured out initially, can play with code to begin with.

// to start with project, we will just start coding according to flow chart that we developed.






