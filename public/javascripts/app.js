var user = null;

var login = function() {
  var usrname = $('#username').val();
  var psword = $('#password').val();

   var body = { username : usrname, password : psword};
   var url = '/tasker/users/login';
   $.ajax( url, {  type : 'POST',  data : body, success : redirectToHome, error : errorFunction } );
}

var updateUser = function( ) {
   $('#profile').text( user.name );
}

var validateDate = function( inputDate ) {
  var date1 = inputDate.replace(/[ ]/g,"");
   var dtRegex = new RegExp(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/);
  if( date1.length!=10  ||  !dtRegex.test(date1) )
    return false;

   var SplitValue = date1.split("/");
        var retVal = true;

        if ( !SplitValue[1].length == 2  ||  !SplitValue[0].length == 2  ||  !SplitValue[2].length == 4) {
            return false;
        }
        
        if (retVal) {
            var Day = parseInt(SplitValue[1], 10);
            var Month = parseInt(SplitValue[0], 10);
            var Year = parseInt(SplitValue[2], 10);
 
            if (retVal = ((Year > 1900) && (Year < 3000))) {
                if (retVal = (Month <= 12 && Month > 0)) {

                    var LeapYear = (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0));   
                    if(retVal = Day > 0)
                    {
                        if (Month == 2) {  
                            retVal = LeapYear ? Day <= 29 : Day <= 28;
                        } 
                        else {
                            if ((Month == 4) || (Month == 6) || (Month == 9) || (Month == 11)) {
                                retVal = Day <= 30;
                            }
                            else {
                                retVal = Day <= 31;
                            }
                        }
                    }
                }
            }
        }
        return retVal;
}





var createTask = function( ) {
  var description = $('#description').val();
  var colorCode = $('#colorCode').val();
  var dueDate = $('#dueDate').val();
 
   if( !validateDate(dueDate) || dueDate.indexOf(" ") !=-1 ){
      $('#dueDate').val("");
      alert("Please enter date with correct format!");
    } else {
      $('#description').val("");
      $('#dueDate').val("");
      $('#colorCode').val("#000000");
      checkContent();
     var body = { description : description, colorCode : colorCode, dueDate : dueDate, uid: user.id };
     var url = '/tasker/users/' + user.id +'/tasks';
     $.ajax( url, {  type : 'POST',  data : body, success : getAll, error : redirectToLogin } );

    $('#keyword').val("");
    $('#overDueOnly').removeAttr( "checked" , false );
    $('#incompleteOnly').removeAttr( "checked" , false );
 }
}

function checkContent (event) {
    if( $('#description').val()!=''  && $('#dueDate').val()!=''){
      $('#submitBtn').removeAttr("disabled");
      $('#submitBtn').attr("onclick","createTask()");
    } else{
      $('#submitBtn').attr("disabled","disabled");
      $('#submitBtn').removeAttr("onclick");
    }
}

var listenInput = function( clickedItem ){
  var parentTR = $(clickedItem).parents("tr");
  var tid = $(clickedItem).parents("tr").attr("id");
  var description =  $(parentTR).find('td:eq(0)').children("input").val() ;
  var colorCode = $(parentTR).find('td:eq(1)').children("input").val();
  var dueDate = $(parentTR).find('td:eq(2)').children("input").val();
  var completed = clickedItem.checked;

  console.log( description + colorCode + dueDate + completed);
  if( description == "" ){
    alert("Task description cannot be empety!");
  } else if( validateDate(dueDate) ) {
    console.log("type of completed: " + typeof completed);
    // Update task

     var body = { description : description, colorCode : colorCode, dueDate : dueDate, completed: completed};
     var url = '/tasker/users/' + user.id +'/tasks/' + tid;
     $.ajax( url, {  type : 'PUT',  data : body, success: setDefaultselect, error : redirectToLogin } );

  }
}

var listenDelete = function(clickedItem) {
  var tid = $(clickedItem).parents("tr").attr("id");
  var url = '/tasker/users/' + user.id +'/tasks/' + tid;
  $.ajax( url, {  type : 'DELETE',  success : getAll, error : redirectToLogin } );
}

var listenSearch = function(event) {
  var key = $('#keyword').val().toLowerCase();

  var table = $('#resultTable');
  table.find('tr').hide();
  table.find('tr:eq(0)').show();

   for(var i = 1 ; i < table.find('tr').length ; i++)
   {    var tmpTR = table.find('tr:eq(' + i + ')');
        var tmpDESC = tmpTR.children("td:eq(0)").children("input").val();
        // console.log("tmpDESC: "+ tmpDESC );
        if( tmpDESC.toLowerCase().indexOf(key) !=-1 ) {
           // console.log("Found key in row "+i)
           table.find('tr:eq(' + i + ')').show();
        }
      
   }

}

var redirectToHome = function() {
   window.location.replace('/home.html');   
}

var redirectToLogin = function( xhr, msg, err ) {
   window.location.replace('/');   
}

var errorFunction = function() {
  $('#warning').show();
}

var getPrincipal = function( ) {
   $.ajax( '/tasker/users',
           { type : 'GET',
             success : function( apiUser ) { user = apiUser; updateUser();getAll();   },
             error : redirectToLogin
           } );
   
}

var updateResult = function( result ) {
  $('#resultTable').text("");
 $('#resultTable').append("<thead style = \" font-weight:bold;\" ><td>Description</td><td>Color</td>  <td>Due</td><td>Completed</td><td></td></thead> <tbody>");
  for(var i=0 ; i<result.length; i++){

  var dateArr = result[i].dueDate.split("-");
  var newDate = dateArr[1]+"/"+dateArr[2]+"/"+dateArr[0] ;
  console.log("req.body.dueDate is: "+ result[i].dueDate  +"  dbdueDate is: "+newDate );
    // console.log( result[i].description +".TYPE:" + (typeof result[i].completed) + "Boolean的值: " + Boolean( result[i].completed));
    if( Boolean(result[i].completed) ){
        $('#resultTable').append(
            "<tr id=\"" + result[i].id + "\"> <td> <input type=\"text\" value=\"" + result[i].description + "\" style=\"border:none;\" oninput=\"listenInput(this)\"></input></td>" +
            "<td><input type=\"color\" class=\"form-control\" id=\"colorInput\" value=\""+ result[i].colorCode + "\" style=\"width:70px\" onchange=\"listenInput(this)\" ></td>" +
            "<td> <input type=\"text\" value=\"" + newDate + "\"style=\"border:none;\"  oninput=\"listenInput(this)\"></input></td>" +
            "<td><input type=\"checkbox\" onchange=\"listenInput(this)\" checked ></td>" +
            "<td><button class=\"btn btn-danger\" type=\"button\"onclick=\"listenDelete(this)\"><span class=\"glyphicon glyphicon-trash\"></span></button></td> </tr>" 
         );    
      }else {
        $('#resultTable').append(
            "<tr id=\"" + result[i].id + "\"><td> <input type=\"text\" value=\"" + result[i].description + "\" style=\"border:none;\"  oninput=\"listenInput(this)\"></input></td>" +
            "<td><input type=\"color\" class=\"form-control\" id=\"colorInput\" value=\""+ result[i].colorCode + "\" style=\"width:70px\" onchange=\"listenInput(this)\"></td>" +
            "<td><input type=\"text\" value=\"" + newDate + "\" style=\"border:none;\" oninput=\"listenInput(this)\" ></input></td>" +
            "<td><input type=\"checkbox\" onchange=\"listenInput(this)\"></td>" +
            "<td><button class=\"btn btn-danger\" type=\"button\"onclick=\"listenDelete(this)\"><span class=\"glyphicon glyphicon-trash\"  ></span></button></td> </tr>" 
        ) ;
      }
  }
  $('#resultTable').append("</tbody>");
  // After updating result, check search field
  listenSearch();
}

var listenComplete = function (event) {
   $('#resultTable').text("");

   // incomplete is YES  overdue is NO
   if( document.getElementById("incompleteOnly").checked){
    $('#overDueOnly').removeAttr( "checked" , false);
    $('#incompleteOnly').attr( "checked" , true);
    var url = '/tasker/users/' + user.id + '/tasks?incomplete=yes&overdue=no' ;
   $.ajax( url, {  type : 'GET',  success : updateResult, error : redirectToLogin } );
   } 
   else if( !document.getElementById("incompleteOnly").checked ) {

    $('#incompleteOnly').removeAttr( "checked" , false );
    var url = '/tasker/users/' + user.id + '/tasks' ;
   $.ajax( url, {  type : 'GET',  success : updateResult, error : redirectToLogin } );
   }
}

var listenOverdue = function (event) {
   $('#resultTable').text("");
   // overdue is NO
   if( !document.getElementById("overDueOnly").checked ){
    $('#overDueOnly').removeAttr( "checked" , false );
     var url = '/tasker/users/' + user.id + '/tasks' ;
   $.ajax( url, {  type : 'GET',  success : updateResult, error : redirectToLogin } );
   } 
   // overdue is YES
   else if( document.getElementById("overDueOnly").checked ) {

    $('#overDueOnly').attr( "checked" , true); 
    $('#incompleteOnly').removeAttr( "checked" , false);

    var url = '/tasker/users/' + user.id + '/tasks?incomplete=no&overdue=yes' ;
   $.ajax( url, {  type : 'GET',  success : updateResult, error : redirectToLogin } );
    }
}

var setDefaultselect = function(){
    $('#keyword').text("");
    $('#overDueOnly').removeAttr( "checked" , false); 
    $('#incompleteOnly').removeAttr( "checked" , false);
    getAll();
}

var getAll = function() {
   var url = 'tasker/users/' + user.id + '/tasks';
   $.ajax( url, {  type : 'GET',  success : updateResult, error : redirectToLogin } );
}

var logout = function() {
   user = null;
   var url = '/logout';
   $.ajax( url, { type : 'GET', success : redirectToLogin, error : redirectToLogin } );
}

