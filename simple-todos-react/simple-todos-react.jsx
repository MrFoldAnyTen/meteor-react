// Define a collection to hold our tasks
Tasks = new Mongo.Collection("tasks");

 if (Meteor.isClient) {
   Accounts.ui.config({
     passwordSignupFields: "USERNAME_ONLY"
   });
   Meteor.subscribe("tasks");
   Meteor.startup(function () {
     // Use Meteor.startup to render the component after the page is ready
     React.render(<App />, document.getElementById("render-target"));
   });
}

if (Meteor.isServer) {
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        {private: {$ne: true}},
        {owner: this.userId}
      ]
    });
  });

}
Meteor.methods({
 addTask(text) {
   // Make sure the user is logged in before inserting a task
   if (! Meteor.userId()) {
     throw new Meteor.Error("not-authorized");
   }

   Tasks.insert({
     text: text,
     createdAt: new Date(),
     owner: Meteor.userId(),
     username: Meteor.user().username
   });
 },

 removeTask(taskId) {
   Tasks.remove(taskId);
 },

 setChecked(taskId, setChecked) {
   Tasks.update(taskId, { $set: { checked: setChecked} });
 },

 setPrivate(taskId, setToPrivate) {
  const task = Tasks.findOne(taskId);
  // Make sure only the task owner can make a task private
  if (task.owner !== Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
  Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});
