var express = require('express');
var router = express.Router();
var crypto = require('crypto');

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function hashTranslator(psword) {
	var hash = crypto.createHash("sha256");
	hash.update(psword);
	return hash.digest('hex');
}
var tasksTable = {
   tasks : {},

   create : function( description, colorCode, dueDate, completed, ownerId ) {
      var result = { id : guid(), description : description, colorCode : colorCode, dueDate : dueDate, completed : completed, ownerId : ownerId };
      tasksTable.tasks[ ownerId ].push( result );
      return result;
   },

   findAllByOwnerId : function( uid ) {
      return tasksTable.tasks[ uid ];
   },
   
   findOne : function( uid, tid ) {
      var tasks = tasksTable.findAllByOwnerId( uid );
      for( var i = 0; i < tasks.length; i ++ ) {
         if( tasks[i].id === tid ) return tasks[i];
      }
      return null;
   },

   "delete" : function( uid, tid ) {
      var task = tasksTable.findOne( uid, tid );
      if( task ) {
         tasksTable.tasks[ uid ] = tasksTable.tasks[ uid ].filter( function( t ) { return t.id !== tid; } );
         return true;
      } else {
         return false;
      }
   },

   update : function( uid, tid, task ) {
      var dbTask = tasksTable.findOne( uid, tid );
	  dbTask.description = task.description;
      dbTask.colorCode = task.colorCode;
      dbTask.dueDate = task.dueDate;
      dbTask.completed = task.completed;
      return dbTask;
   }
};


var usersTable = {
   users : {},

   find : function() {
      var list = [];
      for( var user in usersTable.users ) {
         list.push( usersTable.findOne( user ) );
      }
      return list;
   },
   
   findOne : function( uid ) {
      return usersTable.users[ uid ];
   },

   findByName : function( name ) {
      for( var u in usersTable.users ) {
         var user = usersTable.users[ u ];
         if( user.name === name ) return user;
      }
      return null;
   },

   create : function( name, password, roles ) {
      roles = roles || [];
      var result = { name : name, password : password, roles : roles, id : guid() };
      usersTable.users[ result.id ] = result;
      tasksTable.tasks[ result.id ] = [];
      return result;
   }
};


(function() {
    var data =  [ { name : 'Bilbo', password : 'd0daf06fa44106c4fcf37909a2e4af67db4b6a66630282ae11245b668a265d1b', roles : [ 'user' ] },
                  { name : 'Frodo', password : '0f963b2784d5c5661c898d25d79cdd69144eca961bd68ca631a4349fa7a133a0', roles : [ 'user' ] },
                  { name : 'Gandalf', password : '8816c52bc5877a2b24e3a2f4ae7313d29cf4eba0ca568a36f2d00616cfe721d0', roles : [ 'user' ] },
                  { name : 'Gollum', password : '41703be808847a06f66fcca3868633bf482f1aca51653bb705395ba049d8398b', roles : [ 'user' ] } ];
   data.forEach( function( user ) { usersTable.create( user.name, user.password, user.roles ); } );
}());

// id : guid(), description : description, colorCode : colorCode, dueDate : dueDate, ownerId : ownerId
(function() {
    var data =  [ {description : 'song' , colorCode : '#1d3a2f', dueDate : "2016-02-11", completed : false, ownerId : usersTable.findByName('Bilbo').id},
   				 {description : 'doing homework' , colorCode : '#1d3a2f', dueDate : "2016-05-11", completed : true, ownerId : usersTable.findByName('Bilbo').id},
				{ description : 'programming' , colorCode : '#ff0000', dueDate : "2017-02-08", completed : false, ownerId : usersTable.findByName('Bilbo').id},
				{ description : 'buy grocery' , colorCode : '#aaaaaa', dueDate : "2005-03-11", completed : true, ownerId : usersTable.findByName('Bilbo').id},
                { description : 'learning' , colorCode : '#dffdaa', dueDate : "2012-03-11", completed : false, ownerId : usersTable.findByName('Bilbo').id},
                { description : 'being lazy' , colorCode : '#ddddaa', dueDate : "2012-06-29", completed : false, ownerId : usersTable.findByName('Bilbo').id},
                { description : 'PE class' , colorCode : '#bbddaa', dueDate : "2016-01-08", completed : true, ownerId : usersTable.findByName('Frodo').id},
                { description : 'piano class' , colorCode : '#ddbdaa', dueDate : "2016-02-28", completed : true, ownerId : usersTable.findByName('Frodo').id},
                { description : 'web development class' , colorCode : '#ddddaa', dueDate : "2016-04-05", completed : true, ownerId : usersTable.findByName('Frodo').id},
                { description : 'go hiking' , colorCode : '#ddffaa', dueDate : "2016-02-27", completed : true, ownerId : usersTable.findByName('Frodo').id},
                { description : 'Appointment with professor' , colorCode : '#ddddaa', dueDate : "2016-03-08", completed : true, ownerId : usersTable.findByName('Frodo').id},
                { description : 'exercise' , colorCode : '#0000ff', dueDate : "2015-04-01", completed : true, ownerId : usersTable.findByName('Frodo').id} ];
   data.forEach( function( task ) { tasksTable.create( task.description, task.colorCode, task.dueDate, task.completed, task.ownerId ); } );
}());

var requireAuthentication = function( req, res, next ) {
   // console.log( 'requiring authentication', req.session );
   if( req.session && req.session.user ) {
   		// login method  ( session exist but user is undefined )
   	  if(req.body.username) {
   	  	next();
   	  } else {
   	  	// not login method
      var user = usersTable.findOne( req.session.user.id )  ;
      // console.log( 'user looked up as', user );
      if( user ) {
      // console.log( 'required authenitcation allows the request');         
         req.session.user = user; // refresh the session
         next();
      } else {
         console.log( 'required authenitcation rejected the request 1');         
         req.session.user = {};
         res.status(401).send("Unauthorized");
      }
  }
   } else {
   		// login method ( session expired, so we should check request body )
   	if( req.body.username ) {
   		next();
   	}
      console.log( 'required authenitcation rejected the request 2');
      res.status(401).send("Unauthorized");
   }
}

router.use('/tasker', requireAuthentication );

router.get('/tasker/users', function( req, res, next ) {
   var user = req.session.user;
   res.send( user );
} );

/* GET home page. */
router.get('/', function(req, res, next) {
   res.sendFile( 'index.html', { root : __dirname + "/../public" } );
});



router.post('/tasker/users/login', function( req, res, next ) {
   console.log( 'logging in' );
   var user = usersTable.findByName( req.body.username );
   var ret = { status : 'failure', message : 'username/password combination is incorrect' };
   console.log( 'user', user );
   if( !user ) {
      res.status(401).send( ret );
   } else if( user.password === hashTranslator(req.body.password) ) {
      console.log( 'redirecting home' );
      req.session.user = user;
      res.redirect('/home.html');
   } else {
      res.status(401).send( ret );
   }
} );

var overdue = function (dueDate){
	var yy = dueDate.substring(6,10);
	var mm = dueDate.substring(0,2);
	var dd = dueDate.substring(3,5);
	var a = new Date();
	var year = a.getFullYear();
	var month = a.getMonth()*1+1;
	var day = a.getDate();
	console.log(mm+"/" +dd+"/" +yy);
	console.log("today:" +month+ "/" +day+ "/" +year);
	if( Number(yy) > Number(year)) {
		return false;
	} else if( Number(yy) == Number(year)) {
		if( Number(mm) > Number(month)) {
			return false;
		} else if(Number(mm) == Number(month)) {
			// due on today isn't Over-due
			if(Number(dd) >= Number(day)) {
				return false;
			} 
		}
	}
	return true;
}

router.get('/tasker/users/:uid/tasks', function( req, res, next ) {
	if( req.session.user.id !=  req.params.uid ){
      res.status(403).send("Forbidden");
	}
	if( !req.query.incomplete && !req.query.overdue ) {
		res.send( tasksTable.findAllByOwnerId( req.params.uid ) );
	} else {
	if( req.query.incomplete == 'yes' && req.query.overdue == 'no') {
		var temp, ret = [];
		temp = tasksTable.findAllByOwnerId( req.params.uid );
		for ( var i=0; i<temp.length; i++ ) {
			console.log( "typeof " + "temp["+i+"].description" + typeof temp[i].completed );

			if( temp[i].completed == false) {
				ret.push(temp[i]);
			}
		}
		res.send( ret );
	}
	else if( req.query.incomplete == 'no' && req.query.overdue == 'yes' ) {
		var temp, ret = [];
		temp = tasksTable.findAllByOwnerId( req.params.uid );
		for ( var i=0; i<temp.length; i++ ) {
			console.log(temp[i].description);
			if( overdue(temp[i].dueDate)) {
				ret.push(temp[i]);
			}
		}
		res.send( ret );
	}
	else if( req.query.incomplete == 'no' && req.query.overdue == 'no' ) {
		res.send( tasksTable.findAllByOwnerId( req.params.uid ) );
	}
	else if( req.query.incomplete == 'yes' && req.query.overdue == 'yes' ) {
		var list = [];
		res.send( list );
	}
	} 
});

router.post('/tasker/users/:uid/tasks', function( req, res, next ) {
			// Uid inconsistent with user in seesion
	if( req.session.user.id !=  req.params.uid ){
      res.status(403).send("Forbidden");
	}
	var dateArr = req.body.dueDate.split("/");
	var dbdueDate = dateArr[2]+"-"+dateArr[0]+"-"+dateArr[1] ;
	console.log("req.body.dueDate is: "+req.body.dueDate  +"  dbdueDate is: "+dbdueDate );
	// console.log("create a task: desc:"+req.body.description + ", color:" +req.body.colorCode+ ", duedate:"+req.body.dueDate );
	res.send( tasksTable.create( req.body.description , req.body.colorCode, dbdueDate, false , req.session.user.id ) );
});


router.put('/tasker/users/:uid/tasks/:tid', function( req, res, next ) {
		// Uid inconsistent with user in seesion
	if( (tasksTable.findOne( req.params.uid  ,req.params.tid ) == null) || ( req.session.user.id !=  req.params.uid ) ) {
      res.status(403).send("Forbidden");
	}
	if( req.body.completed == "true"){
		req.body.completed = true;
	} else {
		req.body.completed = false;
	}
	var dateArr = req.body.dueDate.split("/");
	var dbdueDate = dateArr[2]+"-"+dateArr[0]+"-"+dateArr[1] ;
	console.log("req.body.dueDate is: "+req.body.dueDate  +"  dbdueDate is: "+dbdueDate );
	var task = { id : req.params.tid , description : req.body.description, colorCode : req.body.colorCode, dueDate : dbdueDate, completed : req.body.completed, ownerId : req.params.uid }
  	res.send( tasksTable.update( req.params.uid  , req.params.tid , task) );
});

router.delete('/tasker/users/:uid/tasks/:tid', function( req, res, next ) {
	// Task doesn't exist
	if( (tasksTable.findOne( req.params.uid  ,req.params.tid ) == null) || ( req.session.user.id !=  req.params.uid )) {
      	res.status(403).send("Forbidden");
	}

  if( tasksTable.delete( req.params.uid, req.params.tid ) ){
  	 var ret = {status : 'success', message : 'task deleted'};
  	 res.send(ret);
  }
} );

module.exports = router;
