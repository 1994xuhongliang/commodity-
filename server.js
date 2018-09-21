let express = require('express');

let app = new express();

let fs = require('fs');

let session = require('express-session');

let bodyParser = require('body-parser');

let MongoClient = require('mongodb').MongoClient;

let DB = require('./module/db.js');

let multiparty = require('multiparty');

const url = 'mongodb://127.0.0.1:27017';

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use('/upload', express.static('upload'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(session({
	secret: 'xuhongliang',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:1000*60*30
    },
    rolling:true
}))


app.use((req, res, next) => {
	if(req.url == '/login' || req.url == '/dologin') {
		next();
	}else {
		if(req.session.userInfo && req.session.userInfo.username != '') {
			app.locals['userInfo'] = req.session.userInfo;
			next();
		}else {
			res.redirect('/login');
		}
	}
})


// 首页
app.get('/', (req, res) => {
	res.send('index');
})


//登录
app.get('/login',(req, res) => {
    //res.send('login');
    console.log('login')
    res.render('login');

})

// 登录成功
app.post('/dologin', (req, res) => {
	console.log('index', req.body);
	DB.find('management', 'userInfo', req.body, (err, data) => {
		if(err) {
			console.log(err);
			return;
		}
		if(data.length >0) {
			console.log('登陆成功');
			req.session.userInfo = data[0];
			res.redirect('/product')
		}else {
			res.send('<script>alert("登录失败")</script>')
		}
		// res.render()
	})
})

app.get('/product', (req, res) => {
	let name = req.query.name;
	let condition = name?{'name': name}:{};
	DB.find('management', 'product', condition, (err, data) => {
		if(err){
			console.log(err);
			return;
		}
		res.render('product', {'list': data});
	})
})


app.get('/productedit', (req, res) => {
	let _id = new DB.ObjectID(req.query.id);
	DB.find('management', 'product', {'_id': _id}, (err, data) => {
		if(err) {
			console.log(err);
			return;
		}
		res.render('productedit',{'list': data[0]});
	})

})

app.post('/doproductedit', (req, res) => {
	let form = new multiparty.Form();
	form.uploadDir = 'upload';
	form.parse(req, (err, fields, files) => {
		if(err) {
			console.log('出错了：'+err);
			return;
		}
		console.log('fields 是:', fields);
		console.log('files 是:', files);
		let _id = new DB.ObjectID(fields._id[0]),
		name = fields.name[0],
		price = fields.price[0],
		fee = fields.fee[0],
		stock = fields.stock[0],
		description = fields.description[0],
		originalFilename = files.pic[0].originalFilename,
		path = files.pic[0].path,
		setData;
		setData = originalFilename !== ''?{
			_id,
			name,
			price,
			fee,
			stock,
			description,
			path
		}:{
			_id,
			name,
			price,
			fee,
			stock,
			description
		}
		if(originalFilename == ''){fs.unlink(path);};
		DB.updateOne('management', 'product', {'_id': _id}, setData, (err, data) => {
			if(err) {
				console.log(err);
				return;
			}
			res.redirect('/product');
		})

	})
})

app.get('/productdelete', (req, res) => {
	let _id = req.query.id;
	DB.deleteOne('management', 'product', {'_id': new DB.ObjectID(_id)}, (err, data) => {
		if(err) {
			console.log(err);
			return;
		}
		res.redirect('/product');
	})

})

app.get('/productadd', (req, res) => {
	res.render('productadd');
})

app.post('/doproductadd', (req,res) => {
	let form = new multiparty.Form();
	form.uploadDir = 'upload';
	form.parse(req, (err, fields, files) => {
		if(err) {
			console.log('出错了：'+err);
			return;
		}
		console.log('fields 是:', fields);
		console.log('files 是:', files);
		let name = fields.name[0],
		price = fields.price[0],
		fee = fields.fee[0],
		stock = fields.stock[0],
		description = fields.description[0],
		originalFilename = files.pic[0].originalFilename,
		path = files.pic[0].path,
		setData;
		setData = originalFilename !== ''?{
			name,
			price,
			fee,
			stock,
			description,
			path
		}:{
			name,
			price,
			fee,
			stock,
			description
		}
		if(originalFilename == ''){fs.unlink(path);};
		DB.insertOne('management', 'product', setData, (err, data)=> {
			if(err) {
				console.log(err);
				return;
			}
			res.redirect('/product');
		})
	})
})

app.get('/loginOut', (req, res) => {
	req.session.destroy(err => {
		if(err) {
			console.log(err);
		}else {
			res.redirect('/login');
		}
	})
})


app.post('/search', (req, res) => {
	let name = req.body.name;
	res.redirect('/product?name=' + name);
})

app.get('/userlist', (req, res) => {
	let username = req.query.username;
	let condition = username?{'username': username}:{};
	DB.find('management', 'userInfo', condition, (err, data) => {
		if(err){
			console.log(err);
			return;
		}
		res.render('userlist', {'list': data});
	})
})

app.get('/adduser', (req, res)=> {
	res.render('adduser');
})

app.post('/doadduser', (req, res) => {
	let body = req.body;
	DB.insertOne('management', 'userInfo', body, (err, data) => {
		if(err) {
			console.log(err);
			return;
		}
		res.redirect('/userlist');
	})
})


app.get('/useredit', (req, res) => {
	let _id = new DB.ObjectID(req.query.id);
	console.log(_id);
	DB.find('management', 'userInfo', {'_id': _id}, (err, data)=> {
		if(err) {
			console.log(err);
			return;
		}
		res.render('useredit', {'list': data[0]});
	})
})

app.post('/douseredit', (req, res) => {
	let body = req.body;
	let _id = new DB.ObjectID(body._id);
	const {
		username,
		age,
		phone,
		address,
		password,
		passwordconfirm
	} = body;
	console.log(body);
	if(username && age && phone && address && password && passwordconfirm) {
		if(password == passwordconfirm) {
			DB.updateOne('management', 'userInfo', {'_id': _id}, {
				username,
				age,
				phone,
				address,
				password,
				passwordconfirm
			}, (err, data) => {
				if(err) {
					console.log(err);
					return;
				}
				res.redirect('/userlist')
			}) 
		}else {
			res.send('<script>alert("密码不一致")</script>')
			return;
		}
	}else {
		res.send('<script>alert("有必填项未完成")</script>')
		return;
	}
})

app.get('/userdelete', (req, res) => {
	let _id = DB.ObjectID(req.query.id);
	DB.deleteOne('management', 'userInfo', {'_id': _id}, (err, data) => {
		if(err) {
			console.log(err);
			return;
		};
		res.redirect('/userlist');
	})
})

app.post('/searchuser', (req, res) => {
	let name = req.body.name;
	res.redirect('/userlist?username=' + name);
})








app.listen(8888, '127.0.0.1');
