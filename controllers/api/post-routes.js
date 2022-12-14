const router = require('express').Router(); //need express to create routes
const {Post, User, Vote, Comment} = require ('../../models');
const sequelize = require('sequelize')

//returns all
router.get('/', (req, res) => {
    Post.findAll({   
      order: [['created_at', 'DESC']],
 attributes: [
   'id',
   'post_url',
   'title',
   'created_at',
   [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
 ],
 include: [
   // include the Comment model here:
   {
     model: Comment,
     attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
     include: {
       model: User,
       attributes: ['username']
     }
   },
   {
     model: User,
     attributes: ['username']
   }
  ]
}).then(dbPostData => res.json(dbPostData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      
      });
  });

  //Get a single post
  router.get('/:id', (req, res) => {
    Post.findOne({
      where: {
        id: req.params.id
      },
      attributes: ['id', 'post_url', 'title', 'created_at',  [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']],
      include: [
        {
          model: User,
          attributes: ['username']
        }
      ]
    })
      .then(dbPostData => {
        if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
        res.json(dbPostData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });


  //create a post
  router.post('/', (req, res) => {
    // expects {title: 'Taskmaster goes public!', post_url: 'https://taskmaster.com/press', user_id: 1}
    Post.create({
      title: req.body.title,
      post_url: req.body.post_url,
      user_id: req.session.user_id
    })
      .then(dbPostData => res.json(dbPostData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

  // PUT /api/posts/upvote
router.put('/upvote', (req, res) => {
  if (req ,session) { //creating the session first
    //pass session id along with all the destructred properties on req.body
    Post.upvote({ ...req.body, user_id : req.session.user_id}, {Vote, Comment, User})
    .then(updatedVoteData => res.json(updatedVoteData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err)
    })
  } //upvote funcitonality will only work when a user is logged In ^^^

  Vote.create({
    user_id: req.body.user_id,
    post_id: req.body.post_id
  }).then(() => {
    // then find the post we TechBlog voted on
    return Post.findOne({
      where: {
        id: req.body.post_id
      },
      attributes: [
        'id',
        'post_url',
        'title',
        'created_at',
        // use raw MySQL aggregate function query to get a count of how many votes the post has and return it under the name `vote_count`
        [
          sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
          'vote_count'
        ]
      ]
    })

    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
  });
});

  //updates a post
  router.put('/:id', (req ,res )=>{
    Post.update({
      title: req.body.title
    },
    {
      where:{
        id: req.params.id
      }
    }
    )
    .then(dbPostData => {
      if (!dbPostData){
        res.status(404).json({ message : 'No post found with this id'});
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
  });

// delete a post 
router.delete('/:id', (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;