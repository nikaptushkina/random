const express = require('express');
const users = require('./users');
const router  = express.Router();

module.exports = (db) => {
  //POST events/:gen_id/confirm
  router.post("/:gen_id/confirm", (req,res)=>{
    //insert into users if doesnt exist(name & email)
    const email = req.body.email;
    const gen_id = req.params.gen_id;
    let user;
    return db
    .query(`SELECT id FROM users WHERE email = $1;`,[email])
    .then(emailResult =>{
      // console.log(emailResult)
      //IF THE EMAIL EXISTS THEN DO THIS
      if(emailResult.rows.length > 0){
        user = emailResult.rows[0]
        console.log('USER Search +++++++++++++++++++', user)
        const body = req.body;
        //temporary event_time_id
        const event_time_id = 1;
        //temporary response
        const response = true;
        const queryString1 = `INSERT INTO event_attendee_times(user_id, event_time_id, response) VALUES($1, $2, $3) RETURNING *;`;
        const values1 = [user.id, event_time_id, response];
        return db
            .query(queryString1, values1)
            .then(result1 => {
              // console.log(result);
              if (!result1) {
                // console.log("post create result", result);
                res.send({error: "error"});
                return;
              }
              res.render('submitted');
            })
            .catch(err => console.log(err.message))
      }else{
        //IF THAT EMAIL DOES NOT EXIST THEN ADD USER
        const body = req.body;
        const queryString2 = `INSERT INTO users(name, email) VALUES($1, $2) RETURNING *;`;
        const values2 = [body.name, body.email];
        db
          .query(queryString2, values2)
          .then(result1 =>{
            const user_id = result1.rows[0].id
            console.log("+++++++++++ USER", user_id)
            //temporary event_time_id
            const event_time_id = 201;
            //temporary response
            const response = true;
            const queryString1 = `INSERT INTO event_attendee_times(user_id, event_time_id, response) VALUES($1, $2, $3) RETURNING *;`;
            const values1 = [user_id, event_time_id, response];
            return db
              .query(queryString1, values1)  //calling query1 and values1 from above
              .then(result => {
                // console.log(result);
                if (!result) {
                  console.log("post create result", result);
                  res.send({error: "error"});
                  return;
                }
                res.render('submitted');
              })
              .catch(err => console.log(err.message))
          })
      }
    })
        .catch(err => console.log(err.message))
    //insert into event_attendee_times(user_id, event_time_id, response)
  });

  //POST /events
  router.get("/:gen_id", (req,res)=> {
    let gen_id = req.params.gen_id;
      return db
        .query(`SELECT * FROM events JOIN users ON users.id = user_id WHERE gen_id = $1;`, [gen_id])
        .then(result => {
          // console.log(result);
          userName = result.rows[0].name
          title = result.rows[0].title
          description = result.rows[0].description
          location = result.rows[0].location
          link = result.rows[0].link
          gen_id = req.params.gen_id
          const templateVars = {
            "userName": userName,
            "title": title,
            "description": description,
            "location": location,
            "link": link,
            "gen_id": gen_id
          };
          if (!result) {
            console.log("events result", result);
            res.send({error: "error"});
            return;
          }
          res.render(`events`, templateVars);
        })
        .catch(err => console.log(err.message))
  });

  //GET /events
  router.get("/", (req, res) => {
    res.render('events');
  });

  return router;

}
