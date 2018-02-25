$(document).ready(function() {
	var dataStats = false;
	var oneTime = 0;
	var recover;
	// --------------------------------------------------

	// $("#register-form-setup").submit(function(event){
	//     /* Stop form from submitting normally */
	//     event.preventDefault();
	// 	var ajaxRequest;

	// 	var userId = $('#chkEmail').val();

	//     /* Get from elements values */
	//     var values = $(this).serialize();
	//        ajaxRequest= $.ajax({
	//             url: "http://localhost/school/include/func/createuser.php",
	//             type: "POST",
	//             data: values
	//         });

	//       /*  request cab be abort by ajaxRequest.abort() */

	//      ajaxRequest.done(function (response, textStatus, jqXHR){
	//      	  var data = jQuery.parseJSON(response);
	//           if(data.stats==false){
	//           	$("#fStatus").hide().html("Error found in form : "+data.reason).fadeIn();
	//           	return;
	//           }
	//           else{
	//           	$("#sStatus").hide().html("Step Two: Create graphical password ").fadeIn(1000);
	//           	$("#stepone").slideUp();
	//           	$("#userId").val(userId);
	//           	$("#steptwo").delay(1000).slideDown();
	//           }
	//      });

	//      /* On failure of request this function will be called  */
	//      ajaxRequest.fail(function (){
	//        // show error
	//        $("#result").html('There was ean rror on submit');
	//      });
	// });

// -----------------------------------------------------------

	$("#register-form-setup").submit(function(){
		event.preventDefault();
		if(!isEmail($('#chkEmail').val())){
			$("#fUserIdStats").removeClass("gt").addClass("bt").hide().delay(3000).html("Invalid user ID (email address)").fadeIn();
			return;
        }else{
        	$("#fUserIdStats").fadeOut();
           	$("#chkEmail").removeClass("error").addClass("good");
		}
		let userId = $('#chkEmail').val();

        ajaxRequest= $.ajax({
	    	url: "/verifyEmail",
	        type: "POST",
			data: QueryStringToJSON('email='+$("#chkEmail").val()),
			contentType:'application/json',
	        beforeSend: function(){
	    		$("#fUserIdStats").removeClass("gt").removeClass("bt").html("checking if user ID exists").delay(1000);
	    	},
	    });

        ajaxRequest.done(function (response, textStatus, jqXHR){
			console.log(response);
	        if(response.stats){
				$("#chkEmail").removeClass("error");
	           	$("#sStatus").hide().html("Step Two: Create graphical password ").fadeIn(1000);
	          	$("#stepone").slideUp();
	          	$("#userId").val(userId);
	          	$("#steptwo").delay(1000).slideDown();
	           	return;
	        }else{
	        	$("#fUserIdStats").removeClass("gt").addClass("bt").delay(3000).html("user ID already exists (not available)").fadeIn();
	        	$("#chkEmail").removeClass("good").addClass("error");
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

	$("#register-form-complete").submit(function(event){
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

		var hP = sha256(picPass[2]+picPass[1]);
		var rec = sha256($('#chkPw').val());

	    /* Get from elements values */
	    var values = QueryStringToJSON(encodeURI("hPassword="+hP+"&userId="+$('#userId').val()+"&lineValues="+picPass[2]+"&recovery="+rec));

	    /* Send the data using post and put the results in a div */
	    /* I am not aborting previous request because It's an asynchronous request, meaning 
	       Once it's sent it's out there. but in case you want to abort it  you can do it by  
	       abort(). jQuery Ajax methods return an XMLHttpRequest object, so you can just use abort(). */
	       ajaxRequest= $.ajax({
	            url: "/createuser",
	            type: "POST",
				data: values,
				contentType: 'application/json'
	        });

	      /*  request cab be abort by ajaxRequest.abort() */

	     ajaxRequest.done(function (response, textStatus, jqXHR){
			 console.log(response);
	          if(response.stats){
	          	window.location.replace("/login");
	          	return;
	          }
	          else{
	          	$("#fStatus").hide().html("Error found here:<br/>"+response.reason).fadeIn();
	          	return;
	          }
	     });

	     /* On failure of request this function will be called  */
	     ajaxRequest.fail(function (e){
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
		createGraphicalEnvironment();
		resetGridColors();
		moveBoxH();
    	moveBoxV();
	});


	$("#login-step").submit(function(event){
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
	            url: "/getUser",
	            type: "POST",
				data: QueryStringToJSON('email='+$("#userLogin").val()),
				contentType:'application/json'
	        });

	      /*  request cab be abort by ajaxRequest.abort() */

	     ajaxRequest.done(function (response, textStatus, jqXHR){
	     	if(response.stats){
			 var pixs = checkPicPass(getUserInputWithCoord(response.lineValues));
	     		if(pixs[0]){
					console.log(response);
					// authenticate_user(response.user, pixs);
		       	}
		       	else{
		       		$('#fStatus').fadeIn().html('Invalid Graphical password').delay(5000).fadeOut();
		       	}
	     	}
	     	else{
	     		$('#fStatus').fadeIn().html(response.reason).delay(5000).fadeOut();
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

		var hP = sha256(userData.otp,(sha256(picturePass[2]+picturePass[1])));

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

		var hP = sha256(picPass[2]+picPass[1]);
		var rec = $.md5($('#chkPw').val());

	    /* Get from elements values */
	    var values = QueryStringToJSON(encodeURI("hPassword="+hP+"&userId="+$('#userId').val()+"&lineValues="+picPass[2]+"&recovery="+rec));

	       ajaxRequest= $.ajax({
	            url: "/createuser",
	            type: "POST",
	            data: values
	        });

	      /*  request cab be abort by ajaxRequest.abort() */

	     ajaxRequest.done(function (response, textStatus, jqXHR){
			 console.log(response);
	     	// var data = jQuery.parseJSON(response);
	        //   if(data.stats){
	        //   	window.location.replace("http://localhost/school/login.php");
	        //   	$("#fStatus").hide().html(""+data.reason).fadeIn();
	        //   	return;
	        //   }
	        //   else{
	        //   	$("#fStatus").hide().html("Error found "+data.reason).fadeIn();
	        //   	return;
	        //   }
	     });

	     /* On failure of request this function will be called  */
	     ajaxRequest.fail(function (){
			console.log(response);			 
	       // show error
	    //    $("#result").html('There was an error on submit');
	     });
	});

	function QueryStringToJSON(string,parse=false) {            
		var pairs = string.split('&');
		
		var result = {};
		pairs.forEach(function(pair) {
			pair = pair.split('=');
			result[pair[0]] = decodeURIComponent(pair[1] || '');
		});
	
		if(parse)
			return JSON.parse(JSON.stringify(result));
		else
			return JSON.stringify(result);
	}

// ___________________________________Picture Codes


    var firstcol = [2,15,28,41,54,67,80,93,106];
	var secondcol = [4,17,30,43,56,69,82,95,108];
	var thirdcol = [6,19,32,45,58,71,84,97,110];
	var fourthcol = [8,21,34,47,60,73,86,99,112];
	var fifthcol = [10,23,36,49,62,75,88,101,114];
	var sixthcol = [12,25,38,51,64,77,90,103,116];

	var firstrow = [14,15,16,17,18,19,20,21,22,23,24,25,26];
	var secondrow = [40,41,42,43,44,45,46,47,48,49,50,51,52];
	var thirdrow = [66,67,68,69,70,71,72,73,74,75,76,77,78];
	var fourthrow = [92,93,94,95,96,97,98,99,100,101,102,103,104];

	var colColors = ['redc','bluec', 'greenc', 'whitec','yellowc','brownc'];
	var defaultColIndex = [1,2,3,4,5,6];
	var newColIndex = [];

	var rowColors = ['redr', 'bluer', 'greenr', 'whiter'];
	var defaultRowIndex = [1,2,3,4];
	var newRowIndex = [];
	

	function createGraphicalEnvironment(){
		let table = jQuery('#graph-pw');
		let cellValue = 1;
		if(table.length>0){ //If login table is loaded this function will execute
			for (let row = 1; row <= 9; row++) {
				let tr = jQuery('<tr id=row-'+row+'></tr>');
				for (let rowtd = 1; rowtd <=13; rowtd++) {
					let td ='<td id=c'+cellValue+'><span id="c'+cellValue+'l"></span>&nbsp;&nbsp;&nbsp;<span id="c'+cellValue+'r"></span></td>'
					tr.append(td);
					cellValue++;
				}
				table.append(tr);
			}
		}

		table = jQuery('#graph-pwT');		
		if(table.length>0){ //If registration table is loaded this function will execute instead
			console.log(table.length);
			for (let row = 1; row <= 5; row++) {
				let tr = jQuery('<tr id=row-'+row+'></tr>');
				for (let rowtd = 1; rowtd <=5; rowtd++) {
					let td ='<td id=c'+cellValue+'><span id="c'+cellValue+'l"></span>&nbsp;&nbsp;&nbsp;<span id="c'+cellValue+'r"></span></td>'
					tr.append(td);
					cellValue++;
				}
				table.append(tr);
			}
		}
	}	

	// var arr = '<br>';											tester

	function resetGridColors(){
		setColIndex();
		revealRow();
		startMouseIndication();
	}

	function setColIndex(){
		// var str = '';											tester
		newColIndex = [];
		newRowIndex = [];
		while(defaultColIndex.length>0){
			var index = Math.floor((Math.random() * defaultColIndex.length-1)+1);
			if(defaultColIndex[index]!== undefined){
				newColIndex.push(defaultColIndex[index]);
				// str +=defaultColIndex[index]+', '				tester
				// defaultColIndex.forEach(getNewIndex);			tester
				// arr+='<br>';										tester
				defaultColIndex.splice(index, 1 );
			}
		}

		while(defaultRowIndex.length>0){
			var index = Math.floor((Math.random() * defaultRowIndex.length-1)+1);
			if(defaultRowIndex[index]!== undefined){
				newRowIndex.push(defaultRowIndex[index]);
				// str +=defaultColIndex[index]+', '				tester
				// defaultColIndex.forEach(getNewIndex);			tester
				// arr+='<br>';										tester
				defaultRowIndex.splice(index, 1 );
			}
		}
		defaultRowIndex = [1,2,3,4];
		defaultColIndex = [1,2,3,4,5,6];
	}

	function resetCol(){
		firstcol.forEach(setcol);
		secondcol.forEach(setcol);
		thirdcol.forEach(setcol);
		fourthcol.forEach(setcol);
		fifthcol.forEach(setcol);
		sixthcol.forEach(setcol);

	}

	function setcol(item){
		if(jQuery.inArray(item,firstcol)!=-1)
			$('#c'+item).removeClass('redc bluec whitec greenc yellowc brownc').addClass(colColors[newColIndex[0]-1]);
		else if(jQuery.inArray(item,secondcol)!=-1)
			$('#c'+item).removeClass('redc bluec whitec greenc yellowc brownc').addClass(colColors[newColIndex[1]-1]);
		else if(jQuery.inArray(item,thirdcol)!=-1)
			$('#c'+item).removeClass('redc bluec whitec greenc yellowc brownc').addClass(colColors[newColIndex[2]-1]);
		else if(jQuery.inArray(item,fourthcol)!=-1)
			$('#c'+item).removeClass('redc bluec whitec greenc yellowc brownc').addClass(colColors[newColIndex[3]-1]);
		else if(jQuery.inArray(item,fifthcol)!=-1)
			$('#c'+item).removeClass('redc bluec whitec greenc yellowc brownc').addClass(colColors[newColIndex[4]-1]);
		else if(jQuery.inArray(item,sixthcol)!=-1)
			$('#c'+item).removeClass('redc bluec whitec greenc yellowc brownc').addClass(colColors[newColIndex[5]-1]);
	}

	function resetRow(){
		firstrow.forEach(setrow);
		secondrow.forEach(setrow);
		thirdrow.forEach(setrow);
		fourthrow.forEach(setrow);

	}

	function setrow(item){
		if(jQuery.inArray(item,firstrow)!=-1)
			$('#c'+item).removeClass().addClass(rowColors[newRowIndex[0]-1]);
		else if(jQuery.inArray(item,secondrow)!=-1)
			$('#c'+item).removeClass().addClass(rowColors[newRowIndex[1]-1]);
		else if(jQuery.inArray(item,thirdrow)!=-1)
			$('#c'+item).removeClass().addClass(rowColors[newRowIndex[2]-1]);
		else if(jQuery.inArray(item,fourthrow)!=-1)
			$('#c'+item).removeClass().addClass(rowColors[newRowIndex[3]-1]);
	}

	function revealRow(){
		$('#graph-pw').slideUp().hide();
		// $('#first-row').fadeOut().hide(); $('#second-row').fadeOut().hide(); $('#third-row').fadeOut().hide(); $('#fourth-row').fadeOut().hide();
		// $('#fifth-row').fadeOut().hide(); $('#sixth-row').fadeOut().hide(); $('#seventh-row').fadeOut().hide(); $('#eight-row').fadeOut().hide();
		// $('#nineth-row').fadeOut().hide();

		for (var i = 1; i <= 9; i++) {
			$('#row-'+i).fadeOut().hide();
		};

		resetRow();
		resetCol();
		populateCells();

		$('#graph-pw').slideDown();
		for (var i = 0; i < 9; i++) {
			var delay = 500*i;
			$('#row-'+(i+1)).delay(delay).fadeIn('slow');
		};
		// $('#first-row').delay(500).fadeIn(); $('#second-row').delay(1000).fadeIn(); $('#third-row').delay(1500).fadeIn(); $('#fourth-row').delay(2000).fadeIn();
		// $('#fifth-row').delay(2500).fadeIn(); $('#sixth-row').delay(3000).fadeIn(); $('#seventh-row').delay(3500).fadeIn(); $('#eight-row').delay(4000).fadeIn();
		// $('#nineth-row').delay(4500).fadeIn();
	}

	function populateCells(){
		for (var i = 1 ; i <= 117; i++) {
			$('#c'+i+'l').html(randNum());
			$('#c'+i+'r').html(randNum());
		}
	}

	function randNum(){
		return (Math.floor((Math.random() * 10)+1)-1);
	}

	function inverseRow(row){
        var inverse = [];
        for (var i = row.length-1; i >=0 ; i--) {
        	inverse.push(row[i]);
        }
        return inverse;
    }


	function startMouseIndication(){
	 	var x, y, top, left, down, i;
        var $scrollArea = $('#pic-div');

        $($scrollArea).attr("onselectstart", "return false;");   // Disable text selection in IE8

        $($scrollArea).mousedown(function (e) {
            down = true;
            x = e.pageX;
            y = e.pageY;

            $($scrollArea).mouseup(function(){
                down = false;
            });

            $($scrollArea).mousemove(function(e){
                if(down){
                    if((e.pageX-x)>10){
                        $('#topaxis').html('Mouse has moved 20 pixels to the right');
                        x=e.pageX;
                        $('#newx').html(x);
                        moveRight();
                        // return;
                    }
                    else if((e.pageX-x)<-10){
                        $('#topaxis').html('Mouse has moved 20 pixels to the left');
                        x=e.pageX;
                        $('#newx').html(x);
                        moveLeft();
                        // return;
                    }
                    if((e.pageY-y)>10){
                        $('#leftaxis').html('Mouse has moved 20 pixels southwards');
                        y=e.pageY;
                        $('#newy').html(y);
                        moveDown();
                        // return;
                    }
                    else if((e.pageY-y)<-10){
                        $('#leftaxis').html('Mouse has moved 20 pixels northwards');
                        y=e.pageY;
                        $('#newy').html(y);
                        moveUp();
                        // return;
                    }
                }
            });
        });
        $($scrollArea).mouseleave(function (e) {
            down = false;
        });


        var row1 = [1,2,3,4,5,6,7,8,9,10,11,12,13];
        var row2 = [14,15,16,17,18,19,20,21,22,23,24,25,26];
        var row3 = [27,28,29,30,31,32,33,34,35,36,37,38,39];
        var row4 = [40,41,42,43,44,45,46,47,48,49,50,51,52];
        var row5 = [53,54,55,56,57,58,59,60,61,62,63,64,65];
        var row6 = [66,67,68,69,70,71,72,73,74,75,76,77,78];
        var row7 = [79,80,81,82,83,84,85,86,87,88,89,90,91];
        var row8 = [92,93,94,95,96,97,98,99,100,101,102,103,104];
        var row9 = [105,106,107,108,109,110,111,112,113,114,115,116,117];


        function moveRight(){
        	var tempr = '';
        	row1.forEach(rowRight);
        	row2.forEach(rowRight);
        	row3.forEach(rowRight);
        	row4.forEach(rowRight);
        	row5.forEach(rowRight);
        	row6.forEach(rowRight);
        	row7.forEach(rowRight);
        	row8.forEach(rowRight);
        	row9.forEach(rowRight);
        	tempr = '';
        }

        function rowRight(item){
        	var leftValues = [1,14,27,40,53,66,79,92,105];
        	if(jQuery.inArray(item,leftValues)!=-1){
        			tempr = $('#c'+item+'r').html();
        			$('#c'+item+'r').html(randNum());
        			// $('#c'+item+'r').animate({left: '0'}).fadeIn();
        		}
        		else{
        			var temp = $('#c'+item+'r').html();
        			$('#c'+item+'r').html(tempr);
        			tempr = temp;
        		}
        	
        }

        function moveLeft(){
        	var tempr = '';
        	inverseRow(row1).forEach(rowLeft);
        	inverseRow(row2).forEach(rowLeft);
        	inverseRow(row3).forEach(rowLeft);
        	inverseRow(row4).forEach(rowLeft);
        	inverseRow(row5).forEach(rowLeft);
        	inverseRow(row6).forEach(rowLeft);
        	inverseRow(row7).forEach(rowLeft);
        	inverseRow(row8).forEach(rowLeft);
        	inverseRow(row9).forEach(rowLeft);
        	tempr = '';
        }


        function rowLeft(item){
        	var rightValues = [13,26,39,52,65,78,91,104,117]
        	if(jQuery.inArray(item,rightValues)!=-1){
        			tempr = $('#c'+item+'r').html();
        			$('#c'+item+'r').html(randNum());
        		}
        		else{
        			var temp = $('#c'+item+'r').html();
        			$('#c'+item+'r').html(tempr);
        			tempr = temp;
        		}
        }

        var col1 = [1,14,27,40,53,66,79,92,105];
        var col2 = [2,15,28,41,54,67,80,93,106];
        var col3 = [3,16,29,42,55,68,81,94,107];
        var col4 = [4,17,30,43,56,69,82,95,108];
        var col5 = [5,18,31,44,57,70,83,96,109];
        var col6 = [6,19,32,45,58,71,84,97,110];
        var col7 = [7,20,33,46,59,72,85,98,111];
        var col8 = [8,21,34,47,60,73,86,99,112];
        var col9 = [9,22,35,48,61,74,87,100,113];
        var col10 = [10,23,36,49,62,75,88,101,114];
        var col11 = [11,24,37,50,63,76,89,102,115];
        var col12 = [12,25,38,51,64,77,90,103,116];
        var col13 = [13,26,39,52,65,78,91,104,117];

        function moveDown(){
        	var tempr = '';
        	col1.forEach(colDown);
        	col2.forEach(colDown);
        	col3.forEach(colDown);
        	col4.forEach(colDown);
        	col5.forEach(colDown);
        	col6.forEach(colDown);
        	col7.forEach(colDown);
        	col8.forEach(colDown);
        	col9.forEach(colDown);
        	col10.forEach(colDown);
        	col11.forEach(colDown);
        	col12.forEach(colDown);
        	col13.forEach(colDown);
        	tempr = '';
        }

        function colDown(item){
        	var topValues = [1,2,3,4,5,6,7,8,9,10,11,12,13];
        	if(jQuery.inArray(item,topValues)!=-1){
        			tempr = $('#c'+item+'l').html();
        			$('#c'+item+'l').html(randNum());
        		}
        		else{
        			var temp = $('#c'+item+'l').html();
        			$('#c'+item+'l').html(tempr);
        			tempr = temp;
        		}
        }

        function moveUp(){
        	var tempr = '';
        	inverseRow(col1).forEach(colUp);
        	inverseRow(col2).forEach(colUp);
        	inverseRow(col3).forEach(colUp);
        	inverseRow(col4).forEach(colUp);
        	inverseRow(col5).forEach(colUp);
        	inverseRow(col6).forEach(colUp);
        	inverseRow(col7).forEach(colUp);
        	inverseRow(col8).forEach(colUp);
        	inverseRow(col9).forEach(colUp);
        	inverseRow(col10).forEach(colUp);
        	inverseRow(col11).forEach(colUp);
        	inverseRow(col12).forEach(colUp);
        	inverseRow(col13).forEach(colUp);
        	tempr = '';
        }

        function colUp(item){
        	var bottomValues = [105,106,107,108,109,110,111,112,113,114,115,116,117];
        	if(jQuery.inArray(item,bottomValues)!=-1){
        			tempr = $('#c'+item+'l').html();
        			$('#c'+item+'l').html(randNum());
        		}
        		else{
        			var temp = $('#c'+item+'l').html();
        			$('#c'+item+'l').html(tempr);
        			tempr = temp;
        		}
        }
    }

    var int15 = [15,2,3,16,29,28,27,14,1];
    var int17 = [17,4,5,18,31,30,29,16,3];
    var int19 = [19,6,7,20,33,32,31,18,5];
    var int21 = [21,8,9,22,35,34,33,20,7];
    var int23 = [23,10,11,24,37,36,35,22,9];
    var int25 = [25,12,13,26,39,38,37,24,11];
    var int41 = [41,28,29,42,55,54,53,40,27];
    var int43 = [43,30,31,44,57,56,55,42,29];
    var int45 = [45,32,33,46,59,58,57,44,31];
    var int47 = [47,34,35,48,61,60,59,46,33];
    var int49 = [49,36,37,50,63,62,61,48,35];
    var int51 = [51,38,39,52,65,64,63,50,37];
    var int67 = [67,54,55,68,81,80,79,66,53];
    var int69 = [69,56,57,70,83,82,81,68,55];
    var int71 = [71,58,59,72,85,84,83,70,57];
    var int73 = [73,60,61,74,87,86,85,72,59];
    var int75 = [75,62,63,76,89,88,87,74,61];
    var int77 = [77,64,65,78,91,90,89,76,63];
    var int93 = [93,80,81,94,107,106,105,92,79];
    var int95 = [95,82,83,96,109,108,107,94,81];
    var int97 = [97,84,85,98,111,110,109,96,83];
    var int99 = [99,86,87,100,113,112,111,98,85];
    var int101 = [101,88,89,102,115,114,113,100,87];
    var int103 = [103,90,91,104,117,113,115,102,89];

    var horLines = [1,2,3,4];
    var verLines = [1,2,3,4,5,6];
    var picDetails = '';
    var horLine, verLine, vClassName, hClassName, cellPos=9, leftVal, rightVal, line, picCord='';

    function getHorCol(numb){
    	numb = parseInt(numb);
    	switch(numb){
    		case 1:
    		return 'redr';
    		break;
    		case 2:
    		return 'bluer';
    		break;
    		case 3:
    		return 'greenr';
    		break;
    		case 4:
    		return 'whiter';
    		break;
    		default:
    		return 'none';
    	}
    }

    function getVerCol(numb){
    	numb = parseInt(numb);
    	switch(numb){
    		case 1:
    		return 'redc';
    		break;
    		case 2:
    		return 'bluec';
    		break;
    		case 3:
    		return 'greenc';
    		break;
    		case 4:
    		return 'whitec';
    		break;
    		case 5:
    		return 'yellowc';
    		break;
    		case 6:
    		return 'brownc';
    		break;
    		default:
    		return 'none';
    	}
    }

    function sanitizeInput(hLine, vLine, cellp){
    	vClassName = getVerCol(vLine);
    	if(vClassName!='none'){
    		verLine = vLine;
    	}else{
    		verLine = 1;
    		vClassName = 'redc';
    	}

    	hClassName = getHorCol(hLine);
    	if(hClassName!='none')
    		horLine = hLine
    	else{
    		horLine = 1;
    		hClassName = 'redr';
    	}
    	cellp = parseInt(cellp);
    	if(!isNaN(cellp) && cellp<=8 && cellp>=0)
    		cellPos = cellp;
    	else
    		cellPos = 0;
    }

    function getLineValues(lineValues){
    	line = lineValues.split(',');
    	sanitizeInput(line[0],line[1],line[2]);
    }

    var interctions = [15,17,19,21,23,25,41,43,45,47,49,51,67,69,71,
    73,75,77,93,95,97,99,101,103];

    function getValueFromCell(){
    	interctions.forEach(checkClass);
    }


    function checkClass(item){
    	if($('#c'+item).hasClass(hClassName)){
    		if($('#c'+item).hasClass(vClassName)){
	    		var intr = eval('int'+item);
	    		var cell = intr[cellPos];
	    		leftVal = $('#c'+cell+'l').html();
	    		rightVal = $('#c'+cell+'r').html();
	    		picCord = line[0]+','+line[1]+','+line[2]+','+leftVal+','+rightVal;
	    	}
    	}

    	// picCord += $('#c'+item).attr('class')+'<br>';
    }

    function getUserInputWithCoord(coords){
    	getLineValues(coords);
    	getValueFromCell();
    	return horLine+','+verLine+','+cellPos+','+leftVal+','+rightVal;
    }


    // //-----------------------------------------------Begin Registration

    $('#toColors').click(function(){
    	$('#slide-number').fadeOut();
    	$('#choose-colors').delay(1000).fadeIn();
    	$("#subStatus").hide().html("Step 1 : Choose coloured rows and coloumn").fadeIn(1000);
    });

    $('#toSlides').click(function(){
    	var lineh = $("input[type='radio'][name='hline']:checked").val();
    	var linev = $("input[type='radio'][name='vline']:checked").val();

    	if(lineh==undefined || linev==undefined){
    		alert('Please kindly choose lines');
    		return;
    	}

    	hClassName = vClassName = 'none';

    	hClassName = getHorCol(lineh);
    	vClassName = getVerCol(linev);
    	if(hClassName=='none' || vClassName=='none'){
    		alert('Please kindly choose a valid line');
    		return;
    	}

    	horLine = lineh;
    	verLine = linev;

    	$('#choose-colors').fadeOut();
    	$('#slide-number').delay(1000).fadeIn();
    	populateCells();
    	setColRowTuto();
    	startMouseIndicationTutorial();
    	moveBoxH();
    	moveBoxV();
    	getTheCoords();
    	$("#subStatus").hide().html("Step 2: Click on the cell positions relative to the intersection and insert a value").fadeIn(1000);
    	$("#color-lines").html(hClassName+' over '+vClassName+' intersection ');
    });

    function setColRowTuto(){
    	removeAllClass();
    	$('#c3').removeClass().addClass(vClassName);
    	$('#c8').removeClass().addClass(vClassName);
    	$('#c13').removeClass().addClass(vClassName);
    	$('#c18').removeClass().addClass(vClassName);
    	$('#c23').removeClass().addClass(vClassName);


    	$('#c11').removeClass().addClass(hClassName);
    	$('#c12').removeClass().addClass(hClassName);
    	$('#c13').removeClass('redc bluec whitec greenc yellowc brownc').addClass(hClassName);
    	$('#c14').removeClass().addClass(hClassName);
    	$('#c15').removeClass().addClass(hClassName);
    }

    function moveBoxH(){
    	setInterval(function(){
    		$('#box-h').animate({'left':'100px'}).delay(2000).animate({'left':'0'});
    	}, 5000);
    }

    function moveBoxV(){
    	setInterval(function(){
    		$('#box-v').animate({'top':'90px'}).delay(2000).animate({'top':'0'});
    	}, 5000);
    }


    function getTheCoords(){
    	$('#c13').click(function(){
    		cellPos = 0
    		$('#coord').html('Central position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c13l').html();
			rightVal = $('#c13r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});
    	$('#c8').click(function(){
    		cellPos = 1;
    		$('#coord').html('North position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c8l').html();
			rightVal = $('#c8r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});
    	$('#c9').click(function(){
    		cellPos = 2;
    		$('#coord').html('North East position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c9l').html();
			rightVal = $('#c9r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});
    	$('#c14').click(function(){
    		cellPos = 3;
    		$('#coord').html('East position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c14l').html();
			rightVal = $('#c14r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});
    	$('#c19').click(function(){
    		cellPos = 4;
    		$('#coord').html('South East position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c19l').html();
			rightVal = $('#c19r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});
    	$('#c18').click(function(){
    		cellPos = 5;
    		$('#coord').html('South position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c18l').html();
			rightVal = $('#c18r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});
    	$('#c17').click(function(){
    		cellPos = 6;
    		$('#coord').html('South West position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c17l').html();
			rightVal = $('#c17r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});
    	$('#c12').click(function(){
    		cellPos = 7;
    		$('#coord').html('West position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c12l').html();
			rightVal = $('#c12r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});
    	$('#c7').click(function(){
    		cellPos = 8;
    		$('#coord').html('North West position of the ');
    		stopGlow();
    		$(this).css('border','2px solid #f7794f');
    		leftVal = $('#c7l').html();
			rightVal = $('#c7r').html();
			$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
    	});

    	$('#c1,#c2,#c3,#c4,#c5,#c6,c#10,#c11,#c15,#c16,#c20,#c21,#c22,#c23,#c24,#c25').click(function(){
    		alert('Please click the cells close to the Intersection');
    	});
    }

    function checkGPassword(){
    	if(isNaN(cellPos) && cellPos<0 && cellp>8){
    		alert('Click a position close to the intersection');
    		return;
    	}
    	if(isNaN(rightVal)||isNaN(leftVal)){
    		alert('Choose  values');
    		return;
    	}
    }

    function startMouseIndicationTutorial(){
	 	var x, y, top, left, down, i;
        var $scrollArea = $('#pic-div-tutorial');

        $($scrollArea).attr("onselectstart", "return false;");   // Disable text selection in IE8

        $($scrollArea).mousedown(function (e) {
            down = true;
            x = e.pageX;
            y = e.pageY;

            $($scrollArea).mouseup(function(){
                down = false;
            });

            $($scrollArea).mousemove(function(e){
                if(down){
                    if((e.pageX-x)>10){
                        x=e.pageX;
                        moveRightT();
                        // return;
                    }
                    else if((e.pageX-x)<-10){
                        x=e.pageX;
                        moveLeftT();
                        // return;
                    }
                    if((e.pageY-y)>10){
                        y=e.pageY;
                        moveDownT();
                        // return;
                    }
                    else if((e.pageY-y)<-10){
                        y=e.pageY;
                        moveUpT();
                        // return;
                    }

                    if(cellPos!=9){
                    	leftVal = $('#c'+intTu[cellPos]+'l').html();
			    		rightVal = $('#c'+intTu[cellPos]+'r').html();
			    		$('#value-set').html('<strong>Choosen value: </strong>'+leftVal+' '+rightVal);
                    }
                }
            });
        });
        $($scrollArea).mouseleave(function (e) {
            down = false;
        });

        var intTu = [13,8,9,14,19,18,17,12,7];

        var row1T = [1,2,3,4,5];
        var row2T = [6,7,8,9,10];
        var row3T = [11,12,13,14,15];
        var row4T = [16,17,18,19,20];
        var row5T = [21,22,23,24,25];


        function moveRightT(){
        	var tempr = '';
        	row1T.forEach(rowRightT);
        	row2T.forEach(rowRightT);
        	row3T.forEach(rowRightT);
        	row4T.forEach(rowRightT);
        	row5T.forEach(rowRightT);
        	tempr = '';
        }

        function rowRightT(item){
        	var leftValues = [1,6,11,16,21];
        	if(jQuery.inArray(item,leftValues)!=-1){
        			tempr = $('#c'+item+'r').html();
        			$('#c'+item+'r').html(randNum());
        			// $('#c'+item+'r').animate({left: '0'}).fadeIn();
        		}
        		else{
        			var temp = $('#c'+item+'r').html();
        			$('#c'+item+'r').html(tempr);
        			tempr = temp;
        		}
        	
        }

        function moveLeftT(){
        	var tempr = '';
        	inverseRow(row1T).forEach(rowLeftT);
        	inverseRow(row2T).forEach(rowLeftT);
        	inverseRow(row3T).forEach(rowLeftT);
        	inverseRow(row4T).forEach(rowLeftT);
        	inverseRow(row5T).forEach(rowLeftT);
        	tempr = '';
        }

        function rowLeftT(item){
        	var rightValues = [5,10,15,20,25];
        	if(jQuery.inArray(item,rightValues)!=-1){
        			tempr = $('#c'+item+'r').html();
        			$('#c'+item+'r').html(randNum());
        		}
        		else{
        			var temp = $('#c'+item+'r').html();
        			$('#c'+item+'r').html(tempr);
        			tempr = temp;
        		}
        }

        var col1T = [1,6,11,16,21];
        var col2T = [2,7,12,17,22];
        var col3T = [3,8,13,18,23];
        var col4T = [4,9,14,19,24];
        var col5T = [5,10,15,20,25];

        function moveDownT(){
        	var tempr = '';
        	col1T.forEach(colDownT);
        	col2T.forEach(colDownT);
        	col3T.forEach(colDownT);
        	col4T.forEach(colDownT);
        	col5T.forEach(colDownT);
        	tempr = '';
        }

        function colDownT(item){
        	var topValues = [1,2,3,4,5];
        	if(jQuery.inArray(item,topValues)!=-1){
        			tempr = $('#c'+item+'l').html();
        			$('#c'+item+'l').html(randNum());
        		}
        		else{
        			var temp = $('#c'+item+'l').html();
        			$('#c'+item+'l').html(tempr);
        			tempr = temp;
        		}
        }

        function moveUpT(){
        	var tempr = '';
        	inverseRow(col1T).forEach(colUpT);
        	inverseRow(col2T).forEach(colUpT);
        	inverseRow(col3T).forEach(colUpT);
        	inverseRow(col4T).forEach(colUpT);
        	inverseRow(col5T).forEach(colUpT);
        	tempr = '';
        }

        function colUpT(item){
        	var bottomValues = [21,22,23,24,25];
        	if(jQuery.inArray(item,bottomValues)!=-1){
        			tempr = $('#c'+item+'l').html();
        			$('#c'+item+'l').html(randNum());
        		}
        		else{
        			var temp = $('#c'+item+'l').html();
        			$('#c'+item+'l').html(tempr);
        			tempr = temp;
        		}
        }
    }


    function stopGlow(){
    	for (var i = 1 ; i <= 117; i++) {
    		var classes = $('#c'+i).attr('class');
			$('#c'+i).css('border','none');
			$('#c'+i).addClass(classes);
		}
    }

    function removeAllClass(){
    	for (var i = 1 ; i <= 117; i++) {
			$('#c'+i).removeClass();
		}
    }


});