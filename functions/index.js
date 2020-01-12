const functions = require('firebase-functions');

const signup = require('./signup');
const notifications = require('./notifications');

exports.processSignUp = functions.auth.user().onCreate(signup.handler);
exports.notifications = notifications.handler;
