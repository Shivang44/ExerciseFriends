if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.set("show", false);

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


          // Create his account
         /* Accounts.createUser({
              email: email,
            password: password
            });

            Meteor.logout();

            Session.set("show", false);
*/

Accounts.createUser = _.wrap(Accounts.createUser, function(createUser) {
    // Store the original arguments
    var args = _.toArray(arguments).slice(1),
    user = args[0];
    origCallback = args[1];

    var newCallback = function(error) {
        if(error){
            alert(error);
        }
    origCallback.call(this, error);
    };

    createUser(user, newCallback);
});

Accounts.createUser({
     email: email,
   password: password
 });



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
