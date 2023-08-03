# members-only
Members Only Message App (The Odin Project, JavaScript Path, Node.js Course, Authentication)

This aim of this project is to practice creating and authenticating users and giving them different abilities and permissions. This Members Only Message Application is created with the help of Express Application Generator. The app uses a MongoDB database. It is populated with some sample data (by running populatedb.js). It stores Users and their Messages. The app includes authentication (done using the express-session, passport.js (local strategy) and express-flash (to display error messages) middleware).The app has a sign-up form that hashes users' passwords (using bcryptjs). It redirects users from the pages (urls) that they should not be able to visit (because they are logged, or unlogged, or are or aren't members or admins) The views are created with the ejs view engine. The app has responsive design.

This app allows users to share their messages. Anyone who comes to the site can see a list of all messages, with the author’s name hidden. Users can sign up to be able to create messages. Users need to guess riddles to become members (to be able see the author and date of each message) and then admins (to be able to delete any message).

Icons from [SVG Repo](https://www.svgrepo.com/).

Live preview https://members-only-75bu.onrender.com/members-only