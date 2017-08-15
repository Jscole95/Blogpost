const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer, getDate} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Posts', function(){
	//Makes the server start before any tests run
	before(function(){
		return runServer();
	});
	//Closes the server after testing so the next test can run
	after(function(){
		return closeServer();
	});
	it('should return a list of blogs on GET', function(){
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res){
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.length.should.be.at.least(1);
			res.body[0].should.include.keys('title', 'content', 'author', 'publishDate', 'id');
		});
	});
	it('should create a new blog on POST', function(){
		const newBlog = {
			title: 'Thnks fr th Mmrs',
			content: 'Thanks for the Memories',
			author: 'Fall Out Boy',
			publishDate: getDate()
			};
		return chai.request(app)
		.post('/blog-posts')
		.send(newBlog)
		.then(function(res){
			res.should.have.status(201);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.include.keys('title', 'content', 'author', 'publishDate', 'id');
			res.body.id.should.not.be.null;
		});
	});
	it('should remove a blog on DELETE', function(){
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res){
			return chai.request(app)
			.delete(`/blog-posts/${res.body[0].id}`);
		}).then(function(res){
			res.should.have.status(204);
		});
	});
	it('should update a blog on PUT', function(){
		const updatedBlog = {
			title: "New Title",
			content: "New Content",
			author: "New Author",
			date: getDate()
		};
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res){
			updatedBlog.id = res.body[0].id;
			return chai.request(app)
			.put(`/blog-posts/${res.body[0].id}`)
			.send(updatedBlog);
		}).then(function(res){
			res.should.have.status(201);
			res.should.be.json;
			res.should.be.a('object');
			res.body.should.include.keys('title', 'content', 'author', 'publishDate', 'id');
		});
	});
});