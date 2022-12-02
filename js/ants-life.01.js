// JavaScript Document

$(function () {
		
	(function () {
			
		/* Make the mod function work properly so negative numbers return a correct positive value 		
		http://javascript.about.com/od/problemsolving/a/modulobug.htm */
		Number.prototype.mod = function(n) {
			return ((this%n)+n)%n;
		};
		
		// The Model
		var antBrain = {
			
			// the boundaries of the ant's world
			boundaries : {
				top : 0,
				right : 0,
				bottom : 0,
				left : 0
			},
			
			// set the boundaries, the dimensions of the ant's world
			setBoundaries : function (t,r,b,l,s) {
				this.boundaries.top = t;
				this.boundaries.right = Math.floor(r/s);
				this.boundaries.bottom = Math.floor(b/s);
				this.boundaries.left = l;
			},
			
			// the current position of the ant
			position : [0,0],
			
			// set newAntPosition
			setPosition : function () {
				if (arguments[0]) {
					this.position = arguments[0].slice();
				} else {
					this.position[0] = Math.floor(this.boundaries.right / 2);
					this.position[1] = Math.floor(this.boundaries.bottom / 2);
				}
			},
			
			// the four sets of x and y directions; it can't move diagonally
			allDirections : [[1,0],[0,-1],[-1,0],[0,1]], 
			
			// an index for the current direction; possible values 0..3
			direction : 0, 
			
			// advance the direction index; wrap it to zero if larger than 3
			turnRight : function () {
				this.direction --;
				this.direction = this.direction.mod(4);
			},
			
			// set back the direction index; wrap it to 3 if smaller than 0
			turnLeft : function () {
				this.direction ++;
				this.direction = this.direction.mod(4);
			},
			
			// determine which direction to turn, given the current cell colour
			newDirection : function (backGround) {
				if (backGround >= 0) {
					this.turnLeft();
				} else {
					this.turnRight();
				}
			},
			
			// move the ant one step in the current direction
			oneStep : function () {
				this.position[0] += this.allDirections[this.direction][0];
				this.position[0] = this.position[0].mod(this.boundaries.right);
				this.position[1] += this.allDirections[this.direction][1];
				this.position[1] = this.position[1].mod(this.boundaries.bottom);
			}
		};
		
		
		// The Interface
		var theInterface = {
						
			// On touchdevices touchstart, initially assuming a desktop computer
			mouseupOrTouchend : 'mouseup',
			mousedownOrTouchstart : 'mousedown',
			
			initTouchDevice : function () {
				if ('ontouchstart' in document.documentElement) {
					this.mouseupOrTouchend = 'touchend';
					this.mousedownOrTouchstart = 'touchstart';
					$('body').addClass('touchDevice');
				}
			},
			
			// The canvas to draw the ants
			canvas : null,
			
			// The size of the antsworld
			dimensions : {
				top : 0,
				width : 0,
				height : 0,
				left : 0
			},
			
			// initilize some values
			setDimensions : function () {
				this.dimensions.width = $('body').width();
				this.dimensions.height = $('body').height();
			},
			
			// Array with colored cells
			cells : [],
			
			// Copy the cells array
			setCells : function (cellsFromLife) {
				this.cells = cellsFromLife.slice();
			},
			
			// The size of a cell
			cellSize : 4,
			
			// Setter for the cellSize
			setCellSize : function (val) {
				this.cellSize = val;
			},
			
			// The interval between steps
			interval : 0,
			
			// Setter for interval
			setSpeedInterval : function (val) {
				this.interval = val;
			},
			
			// counter for number of steps
			stepCounter : 0,
			
			// Reset stepCounter
			resetStepCounter : function () {
				this.stepCounter = 0;
			},
			
			// increase the stepCounter
			incStepCounter : function () {
				this.stepCounter++;
			},
			
			// clear the Canvas
			clearCanvas : function () {
				var ctx = this.canvas.getContext('2d');
				ctx.fillStyle = "rgb(0, 0, 0)";
				ctx.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
			},
			
			// Calculate real pos on screen by multiplying with cellSize
			reMap : function (val) {
				return val * this.cellSize;
			},
			
			// the Index of the current ant position in pixels
			indexCurrentPixel : 0,
			
			// add the Canvas to the DOM
			addCanvasToDOM : function () {
				$('#thetoroid').remove();
				$('body').prepend('<canvas id="thetoroid" width="' + this.dimensions.width + '" height="' + this.dimensions.height + '"></canvas>');
				this.canvas = document.getElementById('thetoroid'); // The canvas where the ants live
			},
			
			// draw a Pixel on the screen given position
			drawPixel : function (pos) {
				var ctx = this.canvas.getContext('2d');
				ctx.fillStyle = "rgb(128, 128, 0)";
				ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.cellSize, this.cellSize);
				this.cells.push(pos.slice());
			},
			
			// erase a Pixel on the screen given position
			erasePixel : function (pos) {
				var ctx = this.canvas.getContext('2d');
				ctx.fillStyle = "rgb(0, 0, 0)";
				ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.cellSize, this.cellSize);
				this.cells.splice(this.indexCurrentPixel,1);
			},
			
			// draw the ant
			drawAnt : function (pos) {
				var ctx = this.canvas.getContext('2d');
				ctx.fillStyle = "rgb(255, 0, 0)";
				ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.cellSize, this.cellSize);
			},
			
			// Check if a positions exists in the array with cells
			setIndexForCurrentPixel : function (pos) {
				for (var i = this.cells.length; i--; i >= 0) {
					if (this.cells[i][0] === pos[0] && this.cells[i][1] === pos[1]) {
						this.indexCurrentPixel = i;
						return true;
					}
				}
				this.indexCurrentPixel = -1;
				return false;
			},
			
			// flip a Pixel on the screen on given position
			flipPixel : function (pos) {
				if (this.indexCurrentPixel > -1) {
					this.erasePixel(pos);
				} else {
					this.drawPixel(pos);
				}
			},
			
			// update the number of steps done
			updateDisplay : function (steps) {
				$('#steps').val(steps);
			},
			
			// update the number of ants on screen
			updateAntsCount : function (ants) {
				$('#antsCount').val(ants);
			},
			
			//update the speed output with given value (from speed input)
			updateSpeedOutput : function (val) {
				$('output.speed').val(val);
			},
			
			//update the speed output with given value (from speed input)
			updateSizeOutput : function (val) {
				$('output.size').val(val);
			},


			// LIFE RELATED

			// Draw the array with livecells
			drawCells : function () {
				var ctx = this.canvas.getContext('2d');
				ctx.fillStyle = "rgb(0, 0, 0)";
				ctx.fillRect(0, 0, this.dimensions.width, this.dimensions.height);  
				ctx.fillStyle = "rgb(128, 128, 0)";
				for (var count in this.cells) {
					ctx.fillRect(this.cells[count][0] * this.cellSize, this.cells[count][1] * this.cellSize, this.cellSize, this.cellSize);
				}
				return this.cells.length;
			},

			// Update the number of life steps
			updateLifeSteps : function(steps) {
				$('#lifeSteps').val(steps);
			},
			
			// Update the number of cells alive
			updateLifeCells : function(cellsAlive) {
				$('#lifeCount').val(cellsAlive);
			}
			
		};
		
		
		// The Controller 
		var antsController = {
			
			// The variable containing the setInterval
			isRunning : false,
			startRunning : function () {
				this.isRunning = true;
			},
			stopRunning : function () {
				this.isRunning = false;
			},
			
			// The ants
			allAnts : [],
			
			killAnts : function () {
				antsController.allAnts = [];
			},
			
			// Create new ant instance
			newAnt : function (pos) {
				var thisAnt = Object.create(antBrain);
				this.allAnts.push(thisAnt);
				thisAnt.setBoundaries(0, theInterface.dimensions.width, theInterface.dimensions.height, 0, theInterface.cellSize);
				thisAnt.setPosition(pos);
				theInterface.updateAntsCount(this.allAnts.length);
			},
			
			// Initialize some stuff
			init : function () {
				theInterface.setDimensions();
				theInterface.addCanvasToDOM();
				theInterface.setSpeedInterval($('input.speed').val());
				theInterface.setCellSize($('input.size').val());
				theInterface.resetStepCounter();
				theInterface.cells = [];
			},
			
			// The main cycle
			turnFlipStep : function () {
				for (var antIndex = 0; antIndex < antsController.allAnts.length; antIndex ++) {
					var thisAnt = antsController.allAnts[antIndex];
					theInterface.setIndexForCurrentPixel(thisAnt.position);
					thisAnt.newDirection(theInterface.indexCurrentPixel);
					theInterface.flipPixel(thisAnt.position);
					thisAnt.oneStep();
					theInterface.drawAnt(thisAnt.position);
					theInterface.updateDisplay(theInterface.stepCounter);
				}
				theInterface.incStepCounter();
				theInterface.updateDisplay(theInterface.stepCounter);
			},
			
			// Listener for mouseClicks
			listener : function () {
				$('.ants-controls .step').on('click', function () {
					antsController.turnFlipStep();
				});
				$('.ants-controls .stop').on('click', function () {
					antsController.stopRunning();
				});
				$('.ants-controls .run').on('click', function () {
					antsController.startRunning();
					mainController.run();
				});
				$('.ants-controls .clear').on('click', function () {
					antsController.stopRunning();
					antsController.killAnts();
					antsController.init();
				});
				$('body').on(theInterface.mouseupOrTouchend, function (event) {
					if ((event.clientY > $('.ants-controls').outerHeight()) && (event.clientY < ($('.controls-container').height() - $('.life-controls').outerHeight()))) {
						antsController.stopRunning();
						theInterface.updateAntsCount(antsController.allAnts.length);
						antsController.newAnt();
						antsController.allAnts[antsController.allAnts.length-1].setPosition([Math.floor(event.clientX / theInterface.cellSize),Math.floor(event.clientY / theInterface.cellSize)]);
						//antsController.run();
					}
				});
			}
		};
		
		
		// The Life brain
		var lifeBrain = {
			
			// The rules about life and death
			lifeRules : [[0,0,0,1,0,0,0,0,0],[0,0,1,1,0,0,0,0,0]],
			
			// The size of the world / toroid
			boundaries : {
				top : 0,
				right : 0,
				bottom : 0,
				left : 0
			},
			
			// set the boundaries, the dimensions of life
			setBoundaries : function (t,r,b,l,s) {
				this.boundaries.top = t;
				this.boundaries.right = Math.floor(r/s);
				this.boundaries.bottom = Math.floor(b/s);
				this.boundaries.left = l;
			},
			
			// Number of available cells
			cellCount : 0,

			// Set cellCount width * height
			setCellCount : function () {
				this.cellCount = this.boundaries.right * this.boundaries.bottom; 
			},
			
			// Array with x,y coordinates of living cells
			liveCells : [], 
			setLiveCells : function (cells) {
				this.liveCells = cells.slice();
			},
			
			// Array with neighbours count
			neighbours : [],
			
			// Set all neighbours to zero
			clearNeighbours : function () {
				this.neighbours = [];
				for (var count = 0; count < this.cellCount; count++) {
					this.neighbours.push(0);
				}
			},
			
			// Number of cells alive
			cellsAlive : 0,
			setCellsAlive : function (number) {
				this.cellsAlive = number;
			},
			
			// Number of iterations / steps done
			steps : 0,  
		
			// Tell neighbours around livecells they have a neighbour
			nudgeNeighbours : function() {
				var count, thisx, thisy, dx, dy;
				for (count in this.liveCells) {
					thisx = this.liveCells[count][0];
					thisy = this.liveCells[count][1];
					for (dy = -1; dy < 2; dy++) {
						for (dx = -1; dx < 2; dx++) {
							this.neighbours[((thisy + dy) * this.boundaries.right + thisx + dx + this.cellCount)%this.cellCount]++;
						}
					}
					this.neighbours[thisy * this.boundaries.right + thisx] += 9;
				}
			},
	
			// Evaluate neighbourscounts for new livecells
			evalNeighbours : function () {
				var index, thisx, thisy, newCell, thisNeighboursCount;
				
				// Put new pair of values in array
				function Celxy(x, y) {
					this.x = x;
					this.y = y; 
				}
				
				// Add liveCell to array liveCells
				function addLiveCell(atIndex) {
					thisy = Math.floor(atIndex / lifeBrain.boundaries.right);
					thisx = atIndex - (thisy * lifeBrain.boundaries.right);
					lifeBrain.liveCells.push([thisx,thisy]);
				}
				
				this.liveCells = [];
				for (index = 0; index < this.cellCount; index++) {
					thisNeighboursCount = this.neighbours[index];
					newCell = Math.floor(thisNeighboursCount / 10);
					thisNeighboursCount %= 10;
					if (this.lifeRules[newCell][thisNeighboursCount] === 1) {
						addLiveCell(index);
					}
				}
			},
			
			// Iterate life once
			oneGeneration : function () {
				this.steps++;		
				this.clearNeighbours();
				this.nudgeNeighbours();
				this.evalNeighbours();
			}
	
		};
						
		// The Life Controller
		var lifeController = {
			
			isRunning : false,
			startRunning : function () {
				this.isRunning = true;
			},
			stopRunning : function () {
				this.isRunning = false;
			},
			
			// Initialize some stuff
			init : function () {
				lifeBrain.setBoundaries(0, theInterface.dimensions.width, theInterface.dimensions.height, 0, theInterface.cellSize);
				lifeBrain.setCellCount();
			},
			
			getInterfaceCells : function () {
				lifeBrain.setLiveCells(theInterface.cells);
			},
			
			// Do one life step
			stepLife : function (){
				this.getInterfaceCells();
				lifeBrain.oneGeneration();
				theInterface.setCells(lifeBrain.liveCells);
				lifeBrain.setCellsAlive(theInterface.drawCells());
				theInterface.updateLifeCells(lifeBrain.cellsAlive);
				theInterface.updateLifeSteps(lifeBrain.steps);
			},
					
			// Restart everything when user click restart button
			restartLife : function () {
				if (running === true) {clearInterval(gogogo);}
				running = false;
				steps = 0;
				firststep();
				$('.trails').attr('checked', true);
				if (running === false) {gogogo=setInterval(oneGeneration, interval);}
				running = true;
			},
			
			// Clear the canvas (in order to draw manually on it)
			clearLife : function () {
				if (running === true) {clearInterval(gogogo);}
				running = false;
				steps = 0;
				setspace();
				initarrays();
				clearspace();
				drawspace();
				updatedata();
			},
			
			// Listener for life bound events
			listener : function () {
				$('.life-controls .step').click(function() {
					lifeController.stepLife();
				});
				$('.life-controls .run').click(function() {
					lifeController.startRunning();
					mainController.run();
				});
				$('.life-controls .stop').click(function() {
					lifeController.stopRunning();
				});
			}
			
		};
		
		// The Main Controller
		var mainController = {
			running : null,
			
			runLifeAnts : function () {
				if (antsController.isRunning) {
					antsController.turnFlipStep();
					antsController.turnFlipStep();
					antsController.turnFlipStep();
					antsController.turnFlipStep();
					antsController.turnFlipStep();
					antsController.turnFlipStep();
					antsController.turnFlipStep();
					antsController.turnFlipStep();
					antsController.turnFlipStep();
					antsController.turnFlipStep();
				}
				if (lifeController.isRunning) {
					lifeController.stepLife();
				}
			},
			
			stopLifeAnts : function () {
				clearInterval(this.running);
			},
						
			// Run the main cycle each interval miliseconds
			run : function () {
				this.running = setInterval(this.runLifeAnts,theInterface.interval);
			},
			
			listener : function () {
				$('input.speed').on(theInterface.mouseupOrTouchend, function () {
					mainController.stopLifeAnts();
					theInterface.updateSpeedOutput($(this).val());
					theInterface.setSpeedInterval($(this).val());
				});
				$('input.size').on(theInterface.mouseupOrTouchend, function () {
					mainController.stopLifeAnts();
					theInterface.updateSizeOutput($(this).val());
					antsController.init();
					lifeController.init();
				});
			},
			
			init : function () {
				// Start doing this !!
				antsController.init();
				antsController.listener();
				lifeController.init();
				lifeController.listener();
				this.listener();
			}
			
		};
		
		mainController.init();
			
	}());
	
});