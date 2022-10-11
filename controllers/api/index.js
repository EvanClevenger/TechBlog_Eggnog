//this serves as a means to collect all of the API routes and packages them up for us

const router = require('express').Router();

const userRoutes = require('./user-routes.js');
const postRoutes = require('./post-routes')
const commentRoutes = require('./comment-route');

router.use('/users', userRoutes);
//we didn't use the word users in anyof the user-routes? 
//That's because in this file we take those routes and implement them to another router instance, prefixing them with the path /users at that time.
router.use('/posts', postRoutes);

router.use('/comments', commentRoutes);


module.exports = router;