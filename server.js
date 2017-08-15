const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();
const router = express.Router();

app.use(morgan('common'));

BlogPosts.create('Test Title', 'Test Content', 'Test Author', 'Test Date');

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

app.get('/blog-posts', (req, res) => {
	res.status(200).json(BlogPosts.get());
});

app.get('/blog-posts/:id', (req, res) => {
	if (BlogPosts.get(req.params.id) === undefined)
		res.status(404).send(`Post with id ${req.params.id} is undefined`);
	else
		res.status(200).json(BlogPosts.get(req.params.id));
})

app.post('/blog-posts', jsonParser, (req, res) => {
	let input = ['title', 'content', 'author'];
	let test = inBody(req, input);
	if (test === true){
		let post = BlogPosts.create(req.body.title, req.body.content, req.body.author, getDate());
		res.status(201).json(post);
	}
	else 
		res.status(401).send(`Missing ${test} from request body`);
});

app.delete('/blog-posts/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Post id ${req.params.id} has been deleted`);
	res.status(204).end();
});

app.put('/blog-posts/:id', jsonParser, (req, res) => {
	console.log(req.body);
	let input = ['title', 'content', 'author'];
	let test = inBody(req, input);
	if (req.params.id != req.body.id)
		res.status(401).send(`Parameter id and body id do not match`);
	else if (test === true){
		const newBlog = BlogPosts.update({
			id: req.body.id,
			title: req.body.title,
			content: req.body.content,
			author: req.body.author,
			date: getDate()
		});
		res.status(201).json(newBlog);
	}
	else res.status(401).send(`Missing ${test} in request body`);
});

//app.listen(process.env.PORT || 8080, () => {
//	console.log(`Listening on port ${process.env.PORT || 8080}`);
//});

function inBody(req, fields){
	console.log('hello');
	for (let i = 0; i < fields.length; i++){
		let field = fields[i];
		if (!(field in req.body))
			return field;
	}
	return true;
}

function getDate(){
	let today = new Date();
	let date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
	let time = ' @ ';
	let minutes = ':';
	if (today.getMinutes() < 10)
		minutes += '0' + today.getMinutes();
	else
		minutes += today.getMinutes();
	if (today.getHours() > 12)
		time += (today.getHours() - 12) + minutes + 'pm';
	else
		time += (today.getHours()) + minutes + 'am';
	return date + time;
}

module.exports = {app, runServer, closeServer, getDate};
