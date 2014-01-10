(function(){
	function crossword(obj){
		var boxObj = [];
		var data = obj;
		var timerStarted = false;
		var keepTrack = {
		        boxClicked : '0-0',
		        highlight: 'down',
		        wordNum : 1,
		        hintsacross : {},
		        hintsdown : {},
				scrollDir : null,
				inters : null
		    };


		//var ignoreKeyCodes = [8,9,13,16,17,18,19,20,27,32,33,34,35,36,37,38,39,40,45,46,91,92,93,96,97,98,99,100,224];
		var hintContainerHeight = $('#hintsacross').height() / 2 - 20;//half of parent height
		var hintDivHeight = 30; //hint div height

		function getKeyByValue(obj, value) {
		    for( var prop in obj ) {
		        if( obj.hasOwnProperty( prop ) ) {
		             if( obj[ prop ] === value )
		                 return prop;
		        }
		    }
		}

		function scroll(element, rowOrCol){
		    var parent = '#hints'+rowOrCol;
		
			$(keepTrack.wordHintsId).removeClass('highlight');
			keepTrack.wordHintsId = element;

		    // $('.wordHints').removeClass('highlight');
		    var pos = $(element).addClass('highlight').attr('pos');
		    var pix = pos * hintDivHeight;

		    pix = ((pix - hintContainerHeight) < hintContainerHeight) ? 0 : pix-hintContainerHeight;
		    $(parent).stop().animate({ scrollTop: pix +'px' },200);
		
			info(pos, rowOrCol);
		}
		
		function scroll2(element, hightlight2){
		    var parent = '#hints'+hightlight2;
		
			$(keepTrack.wordHintsId2).removeClass('highlight2');
			keepTrack.wordHintsId2 = element;
		
		    var pos = $(element).addClass('highlight2').attr('pos');
		    var pix = pos * hintDivHeight;

		    pix = ((pix - hintContainerHeight) < hintContainerHeight) ? 0 : pix-hintContainerHeight;
		    $(parent).stop().animate({ scrollTop: pix +'px' });
		
			//info(pos, rowOrCol);
		}
		
		function info(pos, rowOrCol){
			if(typeof data.hints[rowOrCol][pos] === 'undefined') return;
			$('#info-msg').removeClass('fadeIn');
			var msg = rowOrCol + ' word #' + data.hints[rowOrCol][pos][0] +' : ' + data.hints[rowOrCol][pos][1];
			$('#info-msg').addClass('fadeIn').html(msg);
		}

		function layoutHints(which){
		    var w = data.hints[which]; //across or down hits json array
		    for(var i=0; i<w.length; i++){
		        $('<div id="'+which+'-'+w[i][0]+'" class="wordHints" pos="'+i+'"><span>'+w[i][0]+'</span>'+w[i][1]+'</div>').appendTo($('#hints'+which));
		    }
		}

		function layoutBox() {
		    var boxId = 0;
		    var boxPerRow = 21;//TODO: COULD BE DYNAMIC BASED ON LETTERS
		    var trackColWords = {};

		    function setBoxObj(boxId, space) {
		        if (typeof boxObj[boxId] === 'undefined') {
		            boxObj[boxId] = {};
		        }

		        var blank = '';
		        var input = '';
		        var answer = '';
		        var b = boxObj[boxId];

		        b['row'] = i;
		        b['col'] = col;
		        b['across'] = j; //across nth word
		        b['down'] = trackColWords[col].nWord; //down nth word
		        b['space'] = space;

		        if (space) {
		            blank = 'blank';
		            answer = '';

		            if (i != 0) { //if not on the first row
		                var aboveBox = Number(b['row']) - 1 + '-' + col; //to see if the above box is space.
		                if (!boxObj[aboveBox]['space']) { //if above box is not space, 
		                    trackColWords[col].nWord += 1; //this is new word.
		                    b['down'] = trackColWords[col].nWord; //down nth word
		                }
		            }
		        } else {
					input = '<span class="edit"></span>';
					answer = '<span class="answer"><span class="solve">' + textArr[t] + '</span>'+input+'</span>';
				}

		        if(col === 0){ //each new row
		            $('<div style="display:block;clear:both"></div>').appendTo($('#crosswords'));
		        }

		        $('<div class="box ' + blank + '" id="' + boxId + '" row-across="' + b.row + '-' + b.across + '" col-down="' + b.col + '-' + b.down + '">' +
		        answer + '</div>').appendTo($('#crosswords'));
		    };

		    for (var x = 0; x < boxPerRow; x++) {
		        trackColWords[x] = {}; //15 cols
		        trackColWords[x].nWord = 0;
		    }

		    for (var i = 0; i < data.crosswords.length; i++) {
		        var col = 0;

		        for (var j = 0; j < data.crosswords[i].length; j++) {
		            if (data.crosswords[i][j] === '') {
		                boxId = i + '-' + col; //unique id for each box, row-col
		                setBoxObj(boxId, true); //this box is blank

		                trackColWords[col].nWord += 1; //this is space, so right below box is new word
		                col = col + 1;
		            } else {
		                var textArr = data.crosswords[i][j].split('');

		                for (var t = 0; t < textArr.length; t++) {
		                    boxId = i + '-' + col; //unique id for each box, row-col
		                    setBoxObj(boxId, false);
		                    col = col + 1;
		                } 
		            } //end if 
		        } //end for 
		    } //end for 
		}; //end layout function

		function printWordNum(boxId){
		    var aboveBox = leftBox = aboveBoxBlank = leftBoxBlank = firstLetter = false;

		    var b = boxObj[boxId];
		    if(b.space) return; //if itself is space, dont bother to check

		    if(b.row === 0 || b.col === 0) {
		        firstLetter = true;
		    } else {
		        aboveBox = Number(b.row - 1) + '-' + b.col;
		        leftBox = b.row + '-' + Number(b.col - 1);

		        aboveBoxBlank = boxObj[aboveBox].space;
		        leftBoxBlank = boxObj[leftBox].space;
		    }

		    if(aboveBoxBlank || leftBoxBlank || firstLetter) {
		        $('<span class="num">'+keepTrack.wordNum+'</span>').appendTo($('#'+boxId));
				//hintacrss[0] = 0-0, hintdown[0] = 0-0. boxId 0 belongs across 0 word, and down 0 word.
		        keepTrack.hintsacross[keepTrack.wordNum] = b.row + '-' + b.across; //which boxes belong to word numbers (boxes with 0-0 belong to box number 1, 2, 3, 4)
		        keepTrack.hintsdown[keepTrack.wordNum] = b.col+ '-' + b.down;
		        keepTrack.wordNum += 1;
		    }
		};

		function findWordNum(){
		    for (var key in boxObj) {
		        if (boxObj.hasOwnProperty(key)){
		            printWordNum(key);
		        }
		    }
		};



		function keyEvents(){
			$('.edit').on('click', function() {
			    $('.edit').removeClass('selected highlight');

			    var boxId = $(this).parents('.box').attr('id'),
			        b = boxObj[boxId],
			        rowAcross = b['row'] + '-' + b['across'],
			        colDown = b['col'] + '-' + b['down'],
			        rowOrCol = boxAttr = hintNum = hints = null;

			    if (keepTrack.boxClicked === boxId) {
			        if(keepTrack.highlight == 'across'){
			            keepTrack.highlight = 'down';
			            boxAttr = 'col-down';
			            rowOrCol = colDown;
			            hints = keepTrack.hintsdown;
			        } else {
			            keepTrack.highlight = 'across';
			            boxAttr = 'row-across';
			            rowOrCol = rowAcross;
			            hints = keepTrack.hintsacross;
			        }

			    } else {
			        keepTrack.highlight = (keepTrack.highlight) ? keepTrack.highlight : 'across'; //across word highlighted right now.
			        // 
					if(keepTrack.highlight == 'across'){
			            boxAttr = 'row-across';
			            rowOrCol = rowAcross;
			            hints = keepTrack.hintsacross;
			        } else {
						boxAttr = 'col-down';
			            rowOrCol = colDown;
			            hints = keepTrack.hintsdown;
			        }
			    }

				$('.box['+boxAttr+'=' + rowOrCol + '] .edit').addClass('highlight');  
		        
			    if(keepTrack.scrollDir === null || keepTrack.scrollDir !== rowOrCol || keepTrack.scrollDir === '0-0'){
					hintNum = getKeyByValue(hints, rowOrCol);
					scroll("#"+keepTrack.highlight+'-'+hintNum, keepTrack.highlight);
					keepTrack.scrollDir = rowOrCol;
				}
		
			    $(this).addClass('selected');
			    keepTrack.boxClicked = boxId;
			
				//----------------- highlight2
				var b2 = boxObj[keepTrack.boxClicked];
				if (keepTrack.highlight == 'across') {
					var second = b2['col'] + '-' + Number(b2['down']);
					var hightlight2 = 'down';
					var hints2 = keepTrack.hintsdown;
				} else {
					var second = b2['row'] + '-' + Number(b2['across']);
					var hightlight2 = 'across';
					var hints2 = keepTrack.hintsacross;
				}
				
				var hintNum2 = getKeyByValue(hints2, second);
				scroll2("#"+hightlight2+'-'+hintNum2, hightlight2);
				//------------------
				
				if(!timerStarted) timer(); timerStarted = true;
			
			}); //end keyevents
			
			function goNextStep(boxId){
				var b =  boxObj[boxId];
				
		        var rowOrCol = boxAttr = hintNum = hints = nextBoxId = null;

		        if (keepTrack.highlight == 'across') {
		            nextBoxId = b['row'] +'-'+ Number(b['col']+1);
		            boxAttr = 'row-across';
					rowOrCol = b['row'] + '-' + b['across'];
					hints = keepTrack.hintsacross;
		        } else {
		            nextBoxId = Number(b['row']+1) +'-'+ b['col'];
					boxAttr = 'col-down';
					rowOrCol = b['col'] + '-' + b['down'];
					hints = keepTrack.hintsdown;
		        }

		        if(typeof boxObj[nextBoxId] == 'undefined' || boxObj[nextBoxId].space || $('#'+nextBoxId).find('.flipped').length > 0) {
			        $('#'+keepTrack.boxClicked+' .edit').addClass('selected');
					return;
		        } else {
					//----- highlight2
					var b2 =  boxObj[nextBoxId];
					if (keepTrack.highlight == 'across') {
						var second = b2['col'] + '-' + Number(b2['down']);
						var hightlight2 = 'down';
						var hints2 = keepTrack.hintsdown;
					} else {
						var second = b2['row'] + '-' + Number(b2['across']);
						var hightlight2 = 'across';
						var hints2 = keepTrack.hintsacross;
					}
					
					var hintNum2 = getKeyByValue(hints2, second);
					scroll2("#"+hightlight2+'-'+hintNum2, hightlight2);
					//-----------------------------
					
					$('#'+nextBoxId+' .edit').addClass('selected');  

					if(keepTrack.scrollDir === null || keepTrack.scrollDir !== rowOrCol){
						
						hintNum = getKeyByValue(hints, rowOrCol);
						scroll("#"+keepTrack.highlight+'-'+hintNum, keepTrack.highlight);
						keepTrack.scrollDir = rowOrCol;
						
					    $('.box['+boxAttr+'=' + rowOrCol + '] .edit').addClass('highlight');
					}
					
					
					keepTrack.boxClicked=nextBoxId;
				}
		    };

		 
		
			function keyTab(id){
				var idArr = id.split('-');
				var dir = idArr[0];
				var wordNum = idArr[1];
				var boxAttr = keepTrack['hints'+dir][wordNum];
				var boxId = div = null;

				$('.edit').removeClass('selected highlight');
				$('.wordHints').removeClass('highlight');
				//$(this).addClass('highlight');

				if(dir == 'across'){
					keepTrack.highlight = 'across';
					div = $('.box[row-across="' + boxAttr + '"]');
				} else {
					keepTrack.highlight = 'down';
					div = $('.box[col-down="' + boxAttr + '"]');	
				}
			
				div.find('.edit').addClass('highlight');
				$(div[0]).find('.edit').addClass('selected');
				boxId = $(div[0]).attr('id');

				keepTrack.boxClicked = boxId;
				keepTrack.wordHintsId = '#'+idArr[0]+'-'+wordNum;
				keepTrack.scrollDir = null;
				scroll(keepTrack.wordHintsId, keepTrack.highlight);
				
				//-------------- highlight2
				var b2 = boxObj[keepTrack.boxClicked];
				if (keepTrack.highlight == 'across') {
					var second = b2['col'] + '-' + Number(b2['down']);
					var hightlight2 = 'down';
					var hints2 = keepTrack.hintsdown;
				} else {
					var second = b2['row'] + '-' + Number(b2['across']);
					var hightlight2 = 'across';
					var hints2 = keepTrack.hintsacross;
				}
				
				var hintNum2 = getKeyByValue(hints2, second);
				scroll2("#"+hightlight2+'-'+hintNum2, hightlight2);
				//--------------
			}
				
			function keyBackspace(id){
				var b =  boxObj[id];
		        var lastBoxId = null;

		        if (keepTrack.highlight == 'across') {
		            lastBoxId = b['row'] +'-'+ Number(b['col']-1);
		        } else {
		            lastBoxId = Number(b['row']-1) +'-'+ b['col'];
		        }
		
				if(typeof boxObj[lastBoxId] == 'undefined' || boxObj[lastBoxId].space ) {
					$('.edit','#'+keepTrack.boxClicked).text('');
   		            return;
   		        }
		
				$('.edit','#'+keepTrack.boxClicked).text('').removeClass('selected');
				$('.edit','#'+lastBoxId).addClass('selected');
				keepTrack.boxClicked = lastBoxId;
				
				//----- highlight2
				var b2 =  boxObj[lastBoxId];
				if (keepTrack.highlight == 'across') {
					var second = b2['col'] + '-' + Number(b2['down']);
					var hightlight2 = 'down';
					var hints2 = keepTrack.hintsdown;
				} else {
					var second = b2['row'] + '-' + Number(b2['across']);
					var hightlight2 = 'across';
					var hints2 = keepTrack.hintsacross;
				}
				
				var hintNum2 = getKeyByValue(hints2, second);
				scroll2("#"+hightlight2+'-'+hintNum2, hightlight2);
				//-----------------------------
					
			}//end keyBackspace
			
			function keyArrows(dir, num){
				var b =  boxObj[keepTrack.boxClicked];
		        var step = (dir == 'right' || dir == 'down') ? 1 : -1;
				var num = (num) ? num : 0;
				var nextBoxId = rowOrCol = boxAttr = hintNum = hints = null;
		
				if (keepTrack.highlight == 'across') {
		            nextBoxId = b['row'] +'-'+ Number(b['col']+step);
					var b2 = boxObj[nextBoxId];
		            boxAttr = 'row-across';
					
					rowOrCol = b2['row'] + '-' + Number(b2['across']);
					hints = keepTrack.hintsacross;
		        } else {
		            nextBoxId = Number(b['row']+step) +'-'+ b['col'];
					var b2 = boxObj[nextBoxId];
					boxAttr = 'col-down';
					
					rowOrCol = b2['col'] + '-' + Number(b2['down']);
					hints = keepTrack.hintsdown;
		        }
		
				if(typeof boxObj[nextBoxId] == 'undefined' || $('#'+nextBoxId).find('.flipped').length > 0) {
			        $('#'+keepTrack.boxClicked+' .edit').addClass('selected');
					return;
					
		        } else if(boxObj[nextBoxId].space){
					$('#'+keepTrack.boxClicked+' .edit').removeClass('selected'); 	
					keepTrack.boxClicked = nextBoxId;
					keyArrows(dir,step);
					
				} else {
					//----- highlight2
					if (keepTrack.highlight == 'across') {
						var second = b2['col'] + '-' + Number(b2['down']);
						var hightlight2 = 'down';
						var hints2 = keepTrack.hintsdown;
					} else {
						var second = b2['row'] + '-' + Number(b2['across']);
						var hightlight2 = 'across';
						var hints2 = keepTrack.hintsacross;
					}
					
					var hintNum2 = getKeyByValue(hints2, second);
					scroll2("#"+hightlight2+'-'+hintNum2, hightlight2);
					//-----------------------------
					
					
					
			        $('#'+keepTrack.boxClicked+' .edit').removeClass('selected'); 
					$('#'+nextBoxId+' .edit').addClass('selected');  
					
					if(keepTrack.scrollDir === null || keepTrack.scrollDir !== rowOrCol || keepTrack.OLDhighlight != keepTrack.highlight){
						
						hintNum = getKeyByValue(hints, rowOrCol);
						scroll("#"+keepTrack.highlight+'-'+hintNum, keepTrack.highlight);
						keepTrack.scrollDir = rowOrCol;
						
						$('.edit').removeClass('highlight');
					    $('.box['+boxAttr+'=' + rowOrCol + '] .edit').addClass('highlight');
					}
					
					keepTrack.boxClicked=nextBoxId;
				}	
			}//end keyArrow
			
			function keydownFunc(e) {
				e.preventDefault();
				keepTrack.OLDhighlight = keepTrack.highlight;
				if (e.keyCode == 8){
					keyBackspace(keepTrack.boxClicked);						
				} else if (e.keyCode == 37){
					keepTrack.highlight = 'across';
					keyArrows('left');
				} else if (e.keyCode == 38){
					keepTrack.highlight = 'down';
					keyArrows('up');
				} else if (e.keyCode == 39){
					keepTrack.highlight = 'across';
					keyArrows('right');
				} else if (e.keyCode == 40){
					keepTrack.highlight = 'down';
					keyArrows('down');
				} else if (e.keyCode == 46){
					$('#'+keepTrack.boxClicked+' .edit').text('');
				} else if (e.keyCode == 9){
					var id = $(keepTrack.wordHintsId).next('.wordHints').attr('id');
					if(typeof id === 'undefined') {
						keepTrack.highlight = (keepTrack.highlight == 'across') ? 'down' : 'across';
						id = keepTrack.highlight+'-1';
					}
					keyTab(id);
					
				} else if((e.keyCode < 65 && e.keyCode !== 46) || e.keyCode > 90){
			        return;
			    } else {
				    var inputText =String.fromCharCode(e.keyCode);
			        $('#'+keepTrack.boxClicked+' .edit').removeClass('selected').text(inputText);
			
			        goNextStep(keepTrack.boxClicked);
			    }
				
				if(!timerStarted) timer(); timerStarted = true;
			}
			
			
			
				
			$(document).keydown(keydownFunc);
			
			

			//---------------------buttons
			$('#reveal').on('click', function(e) {
			    e.preventDefault();
			    $('.answer').addClass('flipped-puzzle');
			});

			$('#revealWord').on('click', function(e) {
			    e.preventDefault();
			    var b = boxObj[keepTrack.boxClicked];

			    if(typeof b == 'undefined') {
		            return;
		        }

			    if(keepTrack.highlight == 'across'){
			        var rowAcross = b['row'] + '-' + b['across'];
			        $('.box[row-across="' + rowAcross + '"] .answer').addClass('flipped');   
			    } else {
			        var colDown = b['col'] + '-' + b['down'];
			        $('.box[col-down="' + colDown + '"] .answer').addClass('flipped');   
			    } 
			});
			
			$('#revealLetter').on('click', function(e) {
			    e.preventDefault();
			    $('#'+keepTrack.boxClicked+' .answer').addClass('flipped');   
			    
			});

			$('#youranswer').on('click', function(e) {
			    e.preventDefault();
			    $('.answer').removeClass('flipped-puzzle');
			});

			$('#restart').on('click', function(e) {
			    e.preventDefault();
				clearInterval(keepTrack.inters);
			
			    $('.answer').removeClass('flipped-puzzle, flipped');
				$( ".edit" ).each(function( index ) {
					$(this).text('');
				});
				timer();
			});
			
			// $('#newGame').on('click', function(e) {
			//     e.preventDefault();
			//     $('#crosswords, #hintsacross, #hintsdown, #buttons').empty();
			//     init('data.json');
			// });

			$('.wordHints').on('click', function(){
				var id = $(this).attr('id');
				var pos = $(this).attr('pos');
				keyTab(id);
				$(this).addClass('highlight');
				info(pos, keepTrack.highlight);
			});
		};
		
		Storage.prototype.setObject = function(key, value) {
		    this.setItem(key, JSON.stringify(value));
		}

		Storage.prototype.getObject = function(key) {
		    var value = this.getItem(key);
		    return value && JSON.parse(value);
		}

		
		
		function WindowCloseHanlder(){
			var letterArr = [];
			$( ".edit" ).each(function( index ) {
				letterArr.push($(this).text());
			});
			
			var json = {
				"letterArr" : letterArr
			};
			
			localStorage.setObject('crossword-letters', json);
		}
		
		function printLocalLetter(){
			var letters = 	localStorage.getObject('crossword-letters');
			if(letters){
				$( ".edit" ).each(function( index ) {
					$(this).text(letters.letterArr[index]);
				});
			}
		}
		
		function layoutButtons(){
			$('<div class="title">You are solving puzzle</div><div id="info-msg"></div>').appendTo($('#info'));
			$('<div id="timer"><span id="hour">00</span><span id="min">00</span><span id="sec">00</span></div>').appendTo($('#info'));
			
			$('<a href="#" class="a-btn" id="youranswer"><span class="a-btn-slide-text">Your Inputs</span><span class="bg">Your Inputs</span></a>').appendTo($('#buttons'));
			$('<a href="#" class="a-btn" id="revealLetter"><span class="a-btn-slide-text">Reveal Letter</span><span class="bg">Reveal Letter</span></a>').appendTo($('#buttons'));
            $('<a href="#" class="a-btn" id="revealWord"><span class="a-btn-slide-text">Reveal Word</span><span class="bg">Reveal Word</span></a>').appendTo($('#buttons'));
            $('<a href="#" class="a-btn" id="reveal"><span class="a-btn-slide-text">Reveal Puzzle</span><span class="bg">Reveal Puzzle</span></a>').appendTo($('#buttons'));
			$('<a href="#" class="a-btn" id="restart"><span class="a-btn-slide-text">Restart Puzzle</span><span class="bg">Restart Puzzle</span></a>').appendTo($('#buttons'));

			//$('<a href="#" class="a-btn" id="newGame"><span class="a-btn-slide-text">New Game</span><span class="bg">New Game</span></a>').appendTo($('#buttons'));
			printLocalLetter()
		};
		
		window.onbeforeunload = WindowCloseHanlder;
		
		function timer(){
			var sec = min = hour = 0;
			var secText = minText = hourText = 0;
			
			keepTrack.inters = setInterval(function(){
				sec += 1;
				if(min > 59){
					hour += 1;
					min = 0;
					hourText = (hour < 10) ? '0'+hour : hour;
					$('#min').text('00');
					$('#hour').text(hourText);	
				}
				if(sec > 59) { 
					min += 1;
					sec = 0;
					minText = (min < 10) ? '0'+min : min;
					$('#min').text(minText);
				}
				
				secText = (sec < 10) ? '0'+sec : sec;
				$('#sec').text(secText);
			},1000);
		}


		layoutBox();
		findWordNum();
		layoutHints('across');
		layoutHints('down');
		layoutButtons();
		keyEvents();		
	};

	function init(url){
		$.getJSON(url, function(obj) {
			crossword(obj);	
		});
	}

	init(window.puzDataUrl);
})();
