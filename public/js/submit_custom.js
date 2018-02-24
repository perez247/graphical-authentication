$(document).ready(function(){
    var dataStats = false;
	var oneTime = 0;
	var recover;
	// --------------------------------------------------

	$("#login-form-setup").submit(function(event){
	    /* Stop form from submitting normally */
	    event.preventDefault();
		var ajaxRequest;

		var userId = $('#chkEmail').val();

	    /* Get from elements values */
	    var values = $(this).serialize();
	       ajaxRequest= $.ajax({
	            url: "http://localhost/school/include/func/createuser.php",
	            type: "POST",
	            data: values
	        });

	      /*  request cab be abort by ajaxRequest.abort() */

	     ajaxRequest.done(function (response, textStatus, jqXHR){
	     	  var data = jQuery.parseJSON(response);
	          if(data.stats==false){
	          	$("#fStatus").hide().html("Error found in form : "+data.reason).fadeIn();
	          	return;
	          }
	          else{
	          	$("#sStatus").hide().html("Step Two: Create graphical password ").fadeIn(1000);
	          	$("#stepone").slideUp();
	          	$("#userId").val(userId);
	          	$("#steptwo").delay(1000).slideDown();
	          }
	     });

	     /* On failure of request this function will be called  */
	     ajaxRequest.fail(function (){
	       // show error
	       $("#result").html('There was ean rror on submit');
	     });
	});

// -----------------------------------------------------------

	$("#chkEmail").keyup(function(){
		if(!isEmail($(this).val())){
			$("#fUserIdStats").removeClass("gt").addClass("bt").hide().delay(3000).html("Invalid user ID (email address)").fadeIn();
			$(this).removeClass("good").addClass("error");
			$('#continue').prop('disabled',true);
			return;
        }else{
        	$("#fUserIdStats").fadeOut();
           	$(this).removeClass("error").addClass("good");
        }
        ajaxRequest= $.ajax({
	    	url: "http://localhost/school/include/func/createuser.php",
	        type: "post",
	        data: 'email='+$(this).val()+'&chkEmail=chkEmail',
	        // dataType: 'json',
	        beforeSend: function(){
	    		$("#fUserIdStats").removeClass("gt").removeClass("bt").html("checking if user ID exists").delay(3000);
	    	},

	    	// success: function(response){
	    	// 	var value = jQuery.parseJSON(response);
	    	// 	$("#fUserIdStats").removeClass("bt").addClass("gt").delay(3000).html(value.userId).fadeIn();
	    	// }
	    });

        ajaxRequest.done(function (response, textStatus, jqXHR){
			console.log(response);
        	var data = jQuery.parseJSON(response);
	        if(data.stats){
	        	$("#fUserIdStats").removeClass("gt").addClass("bt").delay(3000).html("user ID already exists (not available)").fadeIn();
	        	$("#chkEmail").removeClass("good").addClass("error");
	        	$('#continue').prop('disabled',true);
				return;
	        }else{
	        	$("#fUserIdStats").removeClass("bt").addClass("gt").delay(3000).html("user ID available ").fadeIn();
	           	$("#chkEmail").removeClass("error").addClass("good");
	           	$('#continue').prop('disabled',false);
	           	return;
	        }
	    });

	     /* On failure of request this function will be called  */
	    ajaxRequest.fail(function (e){
	       $("#fStatus").html("It seems the connection failed").delay(3000).fadeOut();
	    });
    });

    // -----------------------------------------------------Check if its an email

	function isEmail(email) {
	  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9])+$/;
	  return (email.length >0 && regex.test(email));
	}

	// ------------------------------------------------------

	$("#login-form-complete").submit(function(event){
	    /* Stop form from submitting normally */
	    event.preventDefault();
		var ajaxRequest;

		if(!checkPassword($('#chkPw').val())){
			$("#textPassStats").removeClass("gt").addClass("bt").html("Invalid password, It must be more than eight characters long").fadeIn().delay(3000).fadeOut();
			$('#chkPw').removeClass("good").addClass("error");
			return;
		}
		if(!isEmail($("#userId").val())){
			$("#sUserIdStats").removeClass("gt").addClass("bt").html("Invalid user id (email address)").fadeIn().fadeOut(3000);
			$("#userId").removeClass("good").addClass("error");
			return;
        }

        checkGPassword();
        var picPass = checkPicPass(horLine+','+verLine+','+cellPos+','+leftVal+','+rightVal);
        if (!picPass[0]){
        	$("#picPassStats").removeClass("gt").addClass("bt").html("Invalid graphical password").fadeIn().fadeOut(3000);
			$("#picPass").removeClass("good").addClass("error");
			return;
        }
		// else{
		// 	$('#chkPw').val($.md5($('#chkPw').val()));
		// }

		var hP = sha256(picPass[2]+picPass[1]);
		var rec = $.md5($('#chkPw').val());

	    /* Get from elements values */
	    var values = encodeURI("hPassword="+hP+"&userId="+$('#userId').val()+"&lineValues="+picPass[2]+"&recovery="+rec+"&complete=complete");

	    /* Send the data using post and put the results in a div */
	    /* I am not aborting previous request because It's an asynchronous request, meaning 
	       Once it's sent it's out there. but in case you want to abort it  you can do it by  
	       abort(). jQuery Ajax methods return an XMLHttpRequest object, so you can just use abort(). */
	       ajaxRequest= $.ajax({
	            url: "http://localhost/school/include/func/createuser.php",
	            type: "POST",
	            data: values
	        });

	      /*  request cab be abort by ajaxRequest.abort() */

	     ajaxRequest.done(function (response, textStatus, jqXHR){
	     	var data = jQuery.parseJSON(response);
	          if(data.stats){
	          	window.location.replace("http://localhost/school/login.php");
	          	return;
	          }
	          else{
	          	$("#fStatus").hide().html("Error found here"+data.reason).fadeIn();
	          	return;
	          }
	     });

	     /* On failure of request this function will be called  */
	     ajaxRequest.fail(function (){
	       // show error
	       $("#result").html('There was an error on submit');
	     });
	});

	function checkPassword(password){
		var regex = /^([a-zA-Z0-9_.+-@*'])+$/;
		return (password.length>=8 && regex.test(password))
	}

	function checkPicPass(pass){
		if(pass.length!=9)
			return [false];
		var spliter = pass.split(',');
		for (var i = 0; i <= spliter.length - 1; i++) {
			if (!isNaN(spliter[i]) && (spliter[i]>=0 || spliter[i]<=9)){}
			else{
				return [false];
				break;
			}
		}
		return [true,pass,pass.substr(0,5)];
	}

	$('#login-step1').ready(function(){
		createGraphicalEnvironment()
		resetGridColors();
		moveBoxH();
    	moveBoxV();
	});


	$("#login-step1").submit(function(event){
	    /* Stop form from submitting normally */
	    event.preventDefault();
		var ajaxRequest;

		if(!isEmail($("#userLogin").val())){
			$("#fUserIdStats").removeClass("gt").addClass("bt").html("Invalid user id (email address)").fadeIn().fadeOut(3000);
			$("#userLogin").removeClass("good").addClass("error");
			return;
        }

	    /* Send the data using post and put the results in a div */
	    /* I am not aborting previous request because It's an asynchronous request, meaning 
	       Once it's sent it's out there. but in case you want to abort it  you can do it by  
	       abort(). jQuery Ajax methods return an XMLHttpRequest object, so you can just use abort(). */
	       ajaxRequest= $.ajax({
	            url: "http://localhost/school/include/func/createuser.php",
	            type: "POST",
	           	data: 'email='+$("#userLogin").val()+'&verifyEmail=verifyEmail'
	        });

	      /*  request cab be abort by ajaxRequest.abort() */

	     ajaxRequest.done(function (response, textStatus, jqXHR){
			 console.log(response);
	     	var data = jQuery.parseJSON(response);
	     	if(data.stats){
	     		var pixs = checkPicPass(getUserInputWithCoord(data.lineValues));
	     		if(pixs[0]){
		       		authenticate_user(data, pixs);
		       	}
		       	else{
		       		$('#fStatus').fadeIn().html('Invalid Graphical password').delay(5000).fadeOut();
		       	}
	     	}
	     	else{
	     		$('#fStatus').fadeIn().html(data.reason).delay(5000).fadeOut();
	     	}
	       	
	     });

	     /* On failure of request this function will be called  */
	     ajaxRequest.fail(function (){
	       // show error
	       $("#result").html('There was an error on submit');
	     });
	});

	function authenticate_user(userData, picturePass){
		var ajaxRequest;

		var hP = $.md5(userData.otp,(sha256(picturePass[2]+picturePass[1])));

	    ajaxRequest= $.ajax({
	            url: "http://localhost/school/include/func/createuser.php",
	            type: "POST",
	           	data: 'userId='+userData.userId+'&otp='+userData.otp+'&hPassword='+hP+'&authenticate=authenticate'
	        });

	      /*  request cab be abort by ajaxRequest.abort() */

	     ajaxRequest.done(function (response, textStatus, jqXHR){
	     	var data = jQuery.parseJSON(response);
	     	if(data.stats){
	     		window.location.replace("http://localhost/school/private/");
	          	return;
	     	}
	     	else{
	     		$('#fStatus').fadeIn().html(data.reason).delay(5000).fadeOut();
	     	}
	     });

	     /* On failure of request this function will be called  */
	     ajaxRequest.fail(function (){
	       // show error
	       $("#result").html('There was an error on submit');
	     });
	}


//__________________________________Recover graphical password


$("#recovery").submit(function(event){
	    /* Stop form from submitting normally */
	    event.preventDefault();

		if(!isEmail($("#userLogin").val())){
			$("#fUserIdStats").removeClass("gt").addClass("bt").html("Invalid user id (email address)").fadeIn().fadeOut(3000);
			$("#userLogin").removeClass("good").addClass("error");
			return;
        }

	    $("#stepone").slideUp();
	    $("#userId").val($("#userLogin").val());
	    $("#steptwo").delay(1000).slideDown();

});

$("#recover-form-complete").submit(function(event){
	    /* Stop form from submitting normally */
	    event.preventDefault();
		var ajaxRequest;

		if(!checkPassword($('#chkPw').val())){
			$("#textPassStats").removeClass("gt").addClass("bt").html("Invalid recovery password, It must be more than eight characters long").fadeIn().delay(3000).fadeOut();
			$('#chkPw').removeClass("good").addClass("error");
			return;
		}

		if(!isEmail($("#userId").val())){
			$("#sUserIdStats").removeClass("gt").addClass("bt").html("Invalid user id (email address)").fadeIn().fadeOut(3000);
			$("#userId").removeClass("good").addClass("error");
			return;
        }

        checkGPassword();
        var picPass = checkPicPass(horLine+','+verLine+','+cellPos+','+leftVal+','+rightVal);
        if (!picPass[0]){
        	$("#picPassStats").removeClass("gt").addClass("bt").html("Invalid graphical password").fadeIn().fadeOut(3000);
			$("#picPass").removeClass("good").addClass("error");
			return;
        }
		// else{
		// 	$('#chkPw').val($.md5($('#chkPw').val()));
		// }

		var hP = sha256(picPass[2]+picPass[1]);
		var rec = $.md5($('#chkPw').val());

	    /* Get from elements values */
	    var values = encodeURI("hPassword="+hP+"&userId="+$('#userId').val()+"&lineValues="+picPass[2]+"&recovery="+rec+"&recover=recover");

	       ajaxRequest= $.ajax({
	            url: "http://localhost/school/include/func/createuser.php",
	            type: "POST",
	            data: values
	        });

	      /*  request cab be abort by ajaxRequest.abort() */

	     ajaxRequest.done(function (response, textStatus, jqXHR){
	     	var data = jQuery.parseJSON(response);
	          if(data.stats){
	          	window.location.replace("http://localhost/school/login.php");
	          	$("#fStatus").hide().html(""+data.reason).fadeIn();
	          	return;
	          }
	          else{
	          	$("#fStatus").hide().html("Error found "+data.reason).fadeIn();
	          	return;
	          }
	     });

	     /* On failure of request this function will be called  */
	     ajaxRequest.fail(function (){
	       // show error
	       $("#result").html('There was an error on submit');
	     });
	});

})