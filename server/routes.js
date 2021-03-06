const express = require('express');

const router = express.Router();
const db = require('../db/postgreSql/index.js');

const redis = require('redis');

// For local
// const redisHost = process.env.REDIS_HOST || 'localhost';
// const redisClient = redis.createClient('6379', redisHost);

// For docker & ec2 instance with module
// const redisClient = redis.createClient('6379', '172.17.0.2');


// For ec2 instance with redis
const redisClient = redis.createClient('6379', 'ec2-54-224-248-200.compute-1.amazonaws.com');


// GET request handlers
router.get('/about/:projectId', (req, res) => {
  const { projectId } = req.params;
  // use the redis client to get room info from redis cache
  redisClient.get(`info-${projectId}`, (error, result) => {
    if (result) {
      // the result exists in cache - return it to our user immediately
      console.log('Redis is up and running');
      res.send(JSON.parse(result));
    } else {
      // if there's no cached room data, get it from db
      db.getProjectInfo(req.params.projectId)
        .then((results) => {
          // store the key-value pair (id: data) in cache with an expiry of 1 minute (60s)
          redisClient.setex(`info-${projectId}`, 60, JSON.stringify(results));
          res.writeHead(200);
          res.end(JSON.stringify(results));
        })
        .catch((err) => {
          res.writeHead(404);
          res.end('');
        });
    }
  });
});

router.get('/levels/:projectId', (req, res) => {
  const { projectId } = req.params;
  redisClient.get(`levels-${projectId}`, (error, result) => {
    if (result) {
      // the result exists in cache - return it to our user immediately
      res.send(JSON.parse(result));
    } else {
      db.getAllLevels(req.params.projectId)
        .then((results) => {
          redisClient.setex(`levels-${projectId}`, 60, JSON.stringify(results));
          res.writeHead(200);
          res.end(JSON.stringify(results));
        })
        .catch((err) => {
          res.writeHead(404);
          res.end('');
        });
    }
  });
});


// POST request handlers
router.post('/pledges/:projectId/:levelId', (req, res) => {
  const pledge = req.body;
  db.saveNewPledge(pledge)
    .then((results) => {
      db.updateNumberOfBackersForProjects(pledge);
      db.updateNumberOfBackersForLevels(pledge);
      res.writeHead(200);
      res.end('');
    })
    .catch((err) => {
      res.writeHead(404);
      res.end('');
    });
});

router.post('/pledges/:projectId', (req, res) => {
  const pledge = req.body;
  db.saveNewPledge(pledge)
    .then((results) => {
      db.updateNumberOfBackersForProjects(pledge);
      res.writeHead(200);
      res.end('');
    })
    .catch((err) => {
      res.writeHead(404);
      res.end('');
    });
});


module.exports = router;
