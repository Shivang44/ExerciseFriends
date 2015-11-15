AccountInfo = new Mongo.Collection("accountinfo");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.set("show", false);
  Session.set("showLoading", false);

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

  Template.main.helpers({
      emails: function(){
          return Meteor.user().emails[0].address;
      },
      error_msg: function(msg){
          return Session.get("error_msg");
      },
      showLoading: function(){
          return Session.get("showLoading");
      }
  });


  var clock = 10;

  var timeLeft = function() {
    if (clock > 0) {
      clock--;
      Session.set("time", clock);
      return console.log(clock);
    } else {
      console.log("That's All Folks");
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
        Session.set("showLoading", true);

        // Set current user's search flag to true
        var account_id = Meteor.user()._id;

        // Found document_id using account_id
        var document_id = AccountInfo.find({account_id: account_id}).fetch()[0]._id;

        // Update search flag to true
        AccountInfo.update({_id: document_id}, {$set: {searching: true}});

        var searching_people = AccountInfo.find({searching:true}).fetch();
        var interval = Meteor.setInterval(timeLeft, 1000);

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

          console.log(fitnessLevel);
          console.log(exerciseMethod);
          console.log(time);
          console.log(gender);

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
