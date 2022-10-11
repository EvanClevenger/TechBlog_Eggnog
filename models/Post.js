const {Model, DataTypes } = require('sequelize'); //MODLE and DataTypes we'll use from sequilize packages. 
const sequelize = require ('../config/connection'); //connection to Mysql server 

//create our post model 
class Post extends Model {
    static upvote(body, models) {
      return models.Vote.create({
        user_id: body.user_id,
        post_id: body.post_id
      }).then(() => {
        return Post.findOne({
          where: {
            id: body.post_id
          },
          attributes: [
            'id',
            'post_url',
            'title',
            'created_at',
            [
              sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
              'vote_count'
            ]
          ]
        });
      });
    }
  } //using js static keyword to indicate that the upvote method is one that based on the Post model

//create feilds/columns for post model 
Post.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey : true,
            autoIncrement : true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        post_url:{
            type: DataTypes.STRING,
            allowNull: false,
            validate : {
                isUrl: true //validates url
            }
        }, 
        user_id: { //indicate ownership of this post model by the User model, user_id holds the primary key value of a user. 
            type: DataTypes.INTEGER,
            references:{
                model : 'user',
                key: 'id'
            }
        }
    },

    {
        sequelize,
        freezeTableName : true,
        underscored : true,
        modelName : 'post'
    }
);

module.exports = Post;