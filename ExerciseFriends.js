if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.body.helpers({

    // Through javascript, set this to true if logged in
  });

  Template.body.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.main.helpers({
      emails: function(){
          return Meteor.user().emails[0].address;
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
      }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
