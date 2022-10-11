const router = require('express').Router();
const { User, Post, Vote, Comment} = require('../../models');

// GET /api/users
router.get('/', (req, res) => {
    //access our User modle and run .findALL() method
    User.findAll({
        attributes : { exclude : ['password']} //doesnt return password when using a GET request
    }) //findAll lets us query all of the users from the user table in the database, equivalent to SELECT * FROM users;
        .then (dbUserData => res.json (dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

// GET /api/users/1
router.get('/:id', (req, res) => {
    User.findOne({ //findOne means we only want one peice of data back. also passing an argument in. 
        attributes: { exclude: ['password'] }, 
        where: { //Where option used to indicate we want to find a user where its id value equals whatever req.params:id is equal to SELECT * FROM users WHERE id = 1
            id: req.params.id
        },
        include: [ // include not TechBlog the posts they created but also the votes.
            {
              model: Post,
              attributes: ['id', 'title', 'post_url', 'created_at']
            },
            {
              
                model: Comment,
                attributes:['id', 'comment_text', 'created_at'],
                include: {
                  model: Post,
                  attributes: ['title']
              }
            
            },
            {
              model: Post,
              attributes: ['title'],
              through: Vote,
              as: 'voted_posts'
            }
            
        ]
    })
    .then(dbUserData => {
        if (!dbUserData){
            res.status(404).json({message :"No user found with this id, please try again"});
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
});

// POST /api/users
router.post('/', (req, res) => { 
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
    User.create({ 
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    .then(dbUserData => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
    
        res.json(dbUserData);
      });
    })
})
          //login route
    router.post('/login', (req, res) => {
      User.findOne({
        where: {
          email: req.body.email
        }
      }).then(dbUserData => {
        if (!dbUserData) {
          res.status(400).json({ message: 'No user with that email address!' });
          return;
        }
    
        const validPassword = dbUserData.checkPassword(req.body.password);
    
        if (!validPassword) {
          res.status(400).json({ message: 'Incorrect password!' });
          return;
        }
    
        req.session.save(() => {
          // declare session variables
          req.session.user_id = dbUserData.id;
          req.session.username = dbUserData.username;
          req.session.loggedIn = true;
    
          res.json({ user: dbUserData, message: 'You are now logged in!' });
        });
      });
    });

 router.post('/logout', (req , res) =>{
  if (req.session.loggedIn){
    req.session.destroy(() =>{
      res.status(204).end();
    })
  }
  else{
    res.status(404).end();
  }
 });

// PUT /api/users/1
router.put('/:id', (req, res) => {
  // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}

  // if req.body has exact key/value pairs to match the model, you can TechBlog use `req.body` instead

  User.update(req.body, {  //update method combines the paramaters for creating data and looking up data.
   individualHooks: true, //we must add this option to make beforeUpdate for the hook
    where:{ //req.body provides the new data we want to use in the update and req.params:id to indicate where exactly we want that new data to be used.
        id: req.params.id
    }
  })

  .then(dbUserData =>{
    if (!dbUserData [0]){
        res.status(404).json({message:'No user found with this Id, Please try again'})
        return;
    }
    res.json(dbUserData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// DELETE /api/users/1
router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
            id : req.params.id
        }
    })
    .then(dbUserData =>{
        if (!dbUserData){
            res.status(404).json({message :"No user found with this id"});
            return;
        }
        res.json(dbUserData);
    })
    .catch (err=>{
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;