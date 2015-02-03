/*
 * 'Doggy Memories'
 *
 * Created by Bridget Lane for Prof. Gingold's CS 325
 * Digital Assignment 1 - Digital Prototype
 * 
 * All images created by Bridget Lane
 * 
 * Background music is my own cut of the song "Jaunty Gumption" by Kevin MacLeod:
 *      "Jaunty Gumption" Kevin MacLeod (incompetech.com)
 *      Licensed under Creative Commons: By Attribution 3.0
 *      http://creativecommons.org/licenses/by/3.0/
 *
 * Achievement music is "Friend Request" by plasterbrain (http://soundcloud.com/plasterbrain)
 *
 * Failure music is "Failure 1" by fins (http://freesound.org/people/fins/)
 *
 */
window.onload = function() {    
    "use strict";
    var game = new Phaser.Game(
                                800, 600,           // Width, height of game in px
                                Phaser.AUTO,        // Graphic rendering
                                'game',     
                                { preload: preload, // Preload function
                                  create: create,   // Creation function
                                  update: update }  // Update function
                               );
    
    /*
     * Variable declarations
     *
     */
    var doggy;              // Main character
    var land;               // Group: land
    var ground;             // The floor
    var bgmusic;            // Background music
    var failmusic;          // Music played when a bad cloud is hit, or on losing
    var winmusic;           // Music played when a good cloud is hit, or on winning
    var badmemories;        // Group: badmemories
    var badmemimpact = 5;   // The health impact hitting bad memories has
    var goodmemories;       // Group: goodmemories
    var goodcloudcount = 6; // Initial number of good clouds to collect
    var mentalhealth = 10;  // Mental health
    var score;              // Mental health on-screen text
    var badcloudcount = 7;  // Number of bad clouds to start with
    // goodfunc and badfunc are used to stop the score from changing after
    // you win or lose. You can still collect clouds, but nothing happens
    var goodfunc = grabGoodMem;
    var badfunc = hitBadMem;
    
    /*
     * Preload function
     *
     */
    function preload() {
        // Load images
        game.load.image('dog', 'assets/img/dog.png');
        game.load.image('ground', 'assets/img/ground.png');
        game.load.image('cloud', 'assets/img/cloud.png');
        game.load.image('raincloud', 'assets/img/raincloud.png');
        game.load.image('instructions', 'assets/img/instructions.png');
        game.load.image('win', 'assets/img/youwin.png');
        game.load.image('lose', 'assets/img/gameover.png');
        game.load.image('intro', 'assets/img/intro.png');
        
        // Load audio
        game.load.audio('jaunt', ['assets/audio/jaunt.mp3', 'assets/audio/jaunt.ogg']);
        game.load.audio('failure', ['assets/audio/failure.mp3', 'assets/audio/failure.ogg']);
        game.load.audio('win', ['assets/audio/win.mp3', 'assets/audio/win.ogg']);
    }
    
    /*
     * Starts audio background music, in loop
     *
     */
    function audioStartUp() {
        // Load background music
        bgmusic = game.add.audio('jaunt', 1, true);
        bgmusic.play('', 0, 1, true);
        
        // Load audio for use later
        failmusic = game.add.audio('failure');
        winmusic = game.add.audio('win');
    }
    
    /*
     * Create function
     *
     */
    function create() {
        /* 
         * Set the scene
         *  
         */
        audioStartUp();
         
        game.stage.backgroundColor = '#AEEEEE';     // Background color
        game.add.sprite(0, 0, 'instructions');      // Instructional image
        
        // Create a group for land and enable physics for the whole group
        land = game.add.group();
        land.enableBody = true;
        
        // Create the ground as an object of the land group
        // Set it to the right width and make it immovable
        ground = land.create(0, game.world.height - 40, 'ground');
        ground.scale.setTo(2, 2);
        ground.body.immovable = true;
        
        // Place the bad memories
        setBadMem();
        
        // Mental health display text
        score = game.add.text(250, 16, 'mental health: 10', { fill : '#ffffff' });
        score.font = 'Lucida Console';
        
        /* 
         * Set up the good memories
         *
         */
        goodmemories = game.add.group();
        goodmemories.enableBody = true;
        
        // Distribute the good memories, adding gravity and bounce
        for (var i = 0; i < 6; i++) {
           var mem = goodmemories.create(i*130, 0, 'cloud');
           mem.body.gravity.y = 50;
           mem.body.bounce.y = 0.7 + Math.random()*0.2;
           mem.body.collideWorldBounds = true;
        }

        /* 
         * Set character properties 
         *
         */
        // Create the dog sprite and anchor it to center X axis
        doggy = game.add.sprite(game.world.centerX, 550, 'dog');
        doggy.anchor.set(0.5);
        
        // Give doggy physics, gravity, and don't let the doggy wander off screen
        game.physics.arcade.enable(doggy);
        doggy.body.gravity.y = 200;
        doggy.body.collideWorldBounds = true;
        
        // Display the introduction
        displayIntro();
        
        // Enable cursor keys
        this.cursors = game.input.keyboard.createCursorKeys();     
    }

   /* 
    * Add bad memories to the landscape
    *
    */
    function setBadMem() {
         badmemories = game.add.group();
         badmemories.enableBody = true;
         
         for (var i = 0; i <= badcloudcount; i++) {
            generateRandBadMem();
         }
    }
    
   /* 
    * Generates a random new bad memory cloud
    *
    */
    function generateRandBadMem() {
        // Use these ranges to keep clouds from blocking words or hitting the ground:
        // x : 0 to 700
        // y : 60 to 500
        var randCloud = badmemories.create(game.rnd.integerInRange(0, 700), game.rnd.integerInRange(60, 500), 'raincloud');
        randCloud.body.immovable = true;
    }
    
   /* 
    * What happens when you hit the bad memories
    *
    */
    function hitBadMem(doggy, mem) {
        // Play failure music
        failmusic.play();
    
        // Decrease mental health
        mentalhealth = mentalhealth - badmemimpact;
        
        // Adjust mental health
        score.text = 'mental health: ' + mentalhealth;
        
        // That bad memory has been seen and disappears, a new one pops up
        mem.kill();
        generateRandBadMem();
        
        // If health <= 0, you lose!
        if (mentalhealth <= 0) {
            youLose();
        }
    }
   
   /* 
    * Grab the good memories!
    *
    */
    function grabGoodMem(doggy, mem) {
        // Play winning music
        winmusic.play();
    
        // Good clouds disappear
        mem.kill();
        
        // Mental health increase
        mentalhealth = mentalhealth + 3;
        score.text = 'mental health: ' + mentalhealth;
        
        // One less cloud to get
        goodcloudcount = goodcloudcount - 1;
        
        // If good clouds left <= 0, you win!
        if (goodcloudcount <= 0) {
            youWin();
        }
    }
    
   /* 
    * To be used when doggy hits a cloud after winning or losing
    * Stops score from being altered after winning or losing, even
    * if the player hits every memory left
    *
    */
    function winLoseHit(doggy, mem) {
        mem.kill();
    }
    
   /* 
    * Short player introduction
    *
    */
    function displayIntro() {
        // Add an introductory image
        var intro_img = game.add.sprite(game.world.centerX, game.world.centerY, 'intro');
        intro_img.anchor.set(0.5);
        game.physics.arcade.enable(intro_img);
        
        // Detect when the intro image is clicked
        intro_img.inputEnabled = true;
        intro_img.events.onInputDown.add(dismiss, this);
    }
    
   /* 
    * When the intro image is clicked, kill it
    *
    */
    function dismiss(in_img) {
        in_img.kill();
    }
    
   /* 
    * You Win! message
    *
    */
    function youWin() {
        // Play winning music
        winmusic.play();
    
        // Add the You Win! image, center it, anchor it
        var win = game.add.sprite(game.world.centerX, game.world.centerY, 'win');
        win.anchor.set(0.5);
        game.physics.arcade.enable(win);
        
        // Change what happens when doggy hits any cloud (now hits will not subtract/add to score)
        badfunc = winLoseHit;
        goodfunc = winLoseHit;
    }
    
   /* 
    * You Lose! message
    *
    */
    function youLose() {
        // Play sad failure music
        failmusic.play();
    
        // Add the game over image, center it, anchor it
        var lost = game.add.sprite(game.world.centerX, game.world.centerY, 'lose');
        lost.anchor.set(0.5);
        game.physics.arcade.enable(lost);
        
        // Change what happens when doggy hits any cloud (now hits will not subtract/add to score)
        badfunc = winLoseHit;
        goodfunc = winLoseHit;
    }
    
   /* 
    * Update function
    *
    */
    function update() {
        // Collision checking
        game.physics.arcade.collide(goodmemories, badmemories);
        game.physics.arcade.collide(goodmemories, land);
        
        // Collect good memories or penalize for hitting bad ones
        game.physics.arcade.overlap(doggy, goodmemories, goodfunc, null, this);
        game.physics.arcade.collide(doggy, badmemories, badfunc, null, this); 
      
        /* 
         * Character movement controls
         *
         */
        if (this.cursors.right.isDown && this.cursors.up.isDown) {
            doggy.body.velocity.y = -300;
        }
        else if (this.cursors.left.isDown && this.cursors.up.isDown) {
            doggy.body.velocity.y = -300;
        }
        else if (this.cursors.right.isDown) {
            doggy.body.velocity.x = 300;
        }
        else if (this.cursors.left.isDown) {
            doggy.body.velocity.x = -300;
        }
        else if (this.cursors.up.isDown) {
            doggy.body.velocity.y = -300;
        }
        else {
            doggy.body.velocity.x = 0;
        }
    }
};
