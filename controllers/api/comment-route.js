const router = require('express').Router();
const {Comment, Post, User } = require('../../models');
//const sequelize = require('sequelize');

router.get('/', (req, res) => {
    Post.findAll({
        attributes : ['id', 'comment_text', 'user_id', 'post_id'],
        include : [{
            model: User,
            attributes : ['username']
        }]
    })
    .then(dbCommentData => {
        if (!dbCommentData){
            res.status(404),json({message : "No comment found"});
            return;
        }
        res.json(dbCommentData)
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })

});

router.post('/', (req, res) => {
    //making the session
    if(req.session){
        Comment.create({
            comment_text: req.body.comment_text,
            post_id: req.body.post_id,
            //use the id from the session
            user_id: req.session.user_id
        })
        .then(dbCommentData => res.json(dbCommentData))
        .catch(err =>{
            console.log(err);
            res.status(400).json(err);
        })
    }
    Comment.create({
        comment_text: req.body.comment_text,
        user_id : req.body.user_id,
        post_id : req.body.post_id
    })
    .then(dbCommentData => res.json(dbCommentData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.delete('/:id', (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbCommentData =>{
        if (!dbUserData){
            res.status(404).json({message :"No user found with this id"});
            return;
        }
        res.json(dbCommentData);
    })
    .catch (err=>{
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;