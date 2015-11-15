AccountInfo = new Mongo.Collection("accountinfo");


// 0 = No error message, initial load
// 1 = Error message
// 2 = Success, open chat
function resetSearchingToFalse(failedSearch){
    // Set current user's search flag to true
    var account_id = Meteor.user()._id;

    // Found document_id using account_id
    var document_id = AccountInfo.find({account_id: account_id}).fetch()[0]._id;

    // Update search flag to true
    AccountInfo.update({_id: document_id}, {$set: {searching: false}});

    Session.set("showLoading", false);

    if(failedSearch == 0){
        Session.set("showFailedText", false);
    }else if(failedSearch == 1){
        Session.set("showFailedText", true);
    }else if(failedSearch == 2){

        alert('Open chat!');


        Session.set("showFailedText", false);
        Session.set("showChat", true);

        // Set other user's DB matchCompleted to true
        var other_user_id = Session.get("lowestDelta").account_id;
        var document_id = AccountInfo.find({account_id: other_user_id}).fetch()[0]._id;

        AccountInfo.update({_id: document_id}, {$set: {matchCompleted: true}});
        //  lowestDelta: {account_id:"0", delta: 1000});

    }
}


if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault("show", false);
  Session.setDefault("showLoading", false);
  Session.setDefault("showFailedText", false);
  Session.setDefault("showChat", true);
  Session.setDefault("matchCompleted", false);

  Template.body.helpers({

    // Through javascript, set this to true if logged in
  });

  Template.body.events({

  });

  Template.splash.helpers({
      show: function(){
          return Session.get("show");
      }
  });

  Template.main.rendered = function(){
      // Set current user's search flag to trueresetSearchingToFalse
      resetSearchingToFalse(0);


  }

  Template.main.helpers({
      emails: function(){
          return Meteor.user().emails[0].address;
      },
      error_msg: function(msg){
          return Session.get("error_msg");
      },
      showLoading: function(){
          return Session.get("showLoading");
      },
      currentlySearching: function(){
          Session.set("currentlySearching", AccountInfo.find({searching:true, account_id: {$ne: Meteor.user()._id}}).fetch());
          return Session.get("currentlySearching");
      },
      showFailedText: function(){
          return Session.get("showFailedText");
      },
      showChat: function(){
          return Session.get("showChat");
      },
      listenToOtherUser: function(){
          Session.set("matchCompleted", AccountInfo.find({account_id: Meteor.user()._id}).fetch()[0].matchCompleted);
          // Set to "machCompleted variable of AccountInfo user profile"
          console.log(Session.get("matchCompleted"));
          return Session.get("matchCompleted");
      }

  });


  clock = 10;

  var timeLeft = function() {
      console.log(clock);

      Session.set("lowestDelta", {account_id:"0", delta: 1000});

    if (clock > 0 && !Session.get("matchCompleted")) {
      clock--;
      Session.set("time", clock);

      // List of people currently searching
      var currently_searching = Session.get("currentlySearching");

      // Get our own numbers
      var our_numbers = AccountInfo.find({account_id: Meteor.user()._id}).fetch();
      var oFitness = our_numbers[0].questions.one;
      var oMethod = our_numbers[0].questions.two;
      var oTime = our_numbers[0].questions.three;
      var oGender = our_numbers[0].questions.four;
      var oArray = [oFitness, oMethod, oTime, oGender];

      // This will hold ALL deltas
      var delta_array = [];

      // These are the weights for each category
      // The weights are for fightness, method, time, and gender respectively
      var weights = [3, 5, 3, 1];

      // For each person searching
      deltaTotal = 0; // the lower the better
      for(var i = 0; i < currently_searching.length; i++){
          // Get their number
          var tFitness = currently_searching[i].questions.one;
          var tMethod = currently_searching[i].questions.two;
          var tTime = currently_searching[i].questions.three;
          var tGender = currently_searching[i].questions.four;
          var tArray = [tFitness, tMethod, tTime, tGender];

          // Their account id
          var account_id = currently_searching[i].account_id;

          for(var j=0; j<=3; j++){
              deltaTotal += (Math.abs(oArray[j] - tArray[j])) * weights[j];
          }



          // Found lower delta!
          if(deltaTotal < Session.get("lowestDelta").delta){
              Session.set("lowestDelta", {account_id:account_id, delta: deltaTotal});
          }

          if(deltaTotal <= 10){
              // Found!
              resetSearchingToFalse(2);
              clock = -1;
          }

          delta_array.push({acount_id: account_id, delta: deltaTotal});
      }

      console.log(delta_array);
      console.log(Session.get("lowestDelta"));

      // Find minimum of delta_array


      // 41 is maximum detaTotal

      //////
      // If total delta is 8 OR LESS
      // They are soul mates
      // Hook em up
      /////




      //return console.log(clock);
  } else if(clock == 0) {
      if(Session.get("lowestDelta").delta <= 25){
          // pie (good)
          resetSearchingToFalse(2);
      }else{
          resetSearchingToFalse(1);
      }

      clock = 10;
      return Meteor.clearInterval(interval);
  }else{
      return Meteor.clearInterval(interval);
  }
  };





Template.main.events({
    'click #logoutlink2': function(e){
        e.preventDefault();
        Meteor.logout();
        return false;
    },
    'click #searchbutton': function(e){
        e.preventDefault();
        clock = 10;
        resetSearchingToFalse(0);
        Session.set("showLoading", true);

        // Set current user's search flag to true
        var account_id = Meteor.user()._id;

        // Found document_id using account_id
        var document_id = AccountInfo.find({account_id: account_id}).fetch()[0]._id;

        // Update search flag to true
        AccountInfo.update({_id: document_id}, {$set: {searching: true}});

        // Start comparing
        interval = Meteor.setInterval(timeLeft, 1000);

    }
});

  Template.splash.events({
      'submit #login-form' : function(e, t){
          e.preventDefault();

          // retrive values from form

          var email = t.find('#inputEmail').value;
          var password = t.find('#inputPassword').value;

          /* Use for registration
          var allow_signup = true;
          if(!email.endsWith("osu.edu")){
                alert('You must be an OSU student to use this app!');
                allow_signup = false;
          }
          */

          Meteor.loginWithPassword(email, password, function(err){
              if (err) {
                  alert('Incorrect email/password');
              }
          });

          return false;
      },

      'submit #register-form': function(e, t){
          e.preventDefault();

          // get user data
          var email = t.find('#inputEmail').value;
          var password = t.find('#inputPassword').value;
          var fitnessLevel = t.find('#fitnesslevel').value;
          var exerciseMethod = t.find('#method').value;
          var time = t.find('#time').value;
          var gender = t.find('#gender').value;


          if(!email.endsWith("@osu.edu")){
              alert('You must use an OSU email to signup!');
              return false;
          }



          // Create his account

         Accounts.createUser({email: email, password: password}, function(error){
             if(!error){
                 //Insert user data
                 var accountID = Meteor.user()._id;
                 AccountInfo.insert({
                     account_id: accountID,
                     questions:
                         {one: fitnessLevel,
                         two: exerciseMethod,
                         three: time,
                         four: gender},
                     searching: false
                 });
             }else{
                 alert(error);
             }
         });






//Accounts.verifyEmail();



/* Fix acc already created
Accounts.createUser = _.wrap(Accounts.createUser, function(createUser) {
    // Store the original arguments
    var args = _.toArray(arguments).slice(1),
    user = args[0];
    origCallback = args[1];

    var newCallback = function(error) {
        Session.set("error_msg", error + "");
            origCallback.call(this, error);
    };

    createUser(user, newCallback);
});

Accounts.createUser({
     email: email,
   password: password
 });
 */



      },
      'click #registerlink': function(e){
          e.preventDefault();

          Session.set("show", true);
      },
      'click #loginlink': function(e){
          e.preventDefault();

          Session.set("show", false);
      }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });




}
