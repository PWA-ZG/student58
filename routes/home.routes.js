var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    
    res.render('home', {
        title: 'Task tracker'
    });
});

router.post('/', async function(req, res, next) {
    let reqBody = req.body;
    
    let taskTitle = reqBody['taskTitle'];
    let taskDescription = reqBody['taskDescription'];
    let dueDateTime = reqBody['dueDateTime'];
    let imageInput = reqBody['imageInput'];
    
    
    res.render('home', {
        title: 'Task tracker'
    });
});

module.exports = router;