const admin = require('firebase-admin');
const functions = require('firebase-functions');
const uuidv4 = require('uuidv4');

admin.initializeApp(functions.config().firebase);

exports.handler = user => {
    // Check if user meets role criteria:
    // Your custom logic here: to decide what roles and other `x-hasura-*` should the user get
    let customClaims;
    let userId = uuidv4.fromString(user.uid);
    if (user.email && user.email.indexOf('@splitdiscount.com') !== -1) {
        customClaims = {
            'https://hasura.io/jwt/claims': {
                'x-hasura-default-role': 'admin',
                'x-hasura-allowed-roles': ['user', 'admin'],
                'x-hasura-user-id': userId
            }
        };
    } else {
        customClaims = {
            'https://hasura.io/jwt/claims': {
                'x-hasura-default-role': 'user',
                'x-hasura-allowed-roles': ['user'],
                'x-hasura-user-id': userId
            }
        };
    }
    console.log(user, customClaims);

    // Set custom user claims on this newly created user.
    return admin.auth().setCustomUserClaims(user.uid, customClaims)
        .then(() => {
            // Update real-time database to notify client to force refresh.
            const metadataRef = admin.database().ref("metadata/" + user.uid);
            // Set the refresh time to the current UTC timestamp.
            // This will be captured on the client to force a token refresh.
            return metadataRef.set({refreshTime: new Date().getTime()});
        })
        .catch(error => {
            console.log(error);
        });
}