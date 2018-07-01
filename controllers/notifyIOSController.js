'use strict';
const apn = require('apn');

exports.sendNotifyIOS = (obj) => {
    let apnProvider = new apn.Provider({
        token: {
            key: 'apns.p8', // Path to the key p8 file
            keyId: 'PDSQJ33AHF', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
            teamId: '45D84HJ79U', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
        },
        production: false // Set to true if sending a notification to a production iOS app
    });
    // Enter the device token from the Xcode console
    let deviceToken = obj.device_token;
    // Prepare a new notification
    let notification = new apn.Notification();
    // Specify your iOS app's Bundle ID (accessible within the project editor)
    notification.topic = 'com.QooServices.QooServices';
    // Set expiration to 1 hour from now (in case device is offline)
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    // Set app badge indicator
    notification.badge = obj.countMes;
    // Play ping.aiff sound when the notification is received
    notification.sound = 'ping.aiff';
    // Display the following message (the actual notification text, supports emoji)
    notification.alert = obj.content_text;
    // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
    notification.payload = {
        id: 123
    };
    // Actually send the notification
    apnProvider.send(notification, deviceToken).then(function (result) {
        // Check the result for any failed devices
        console.log(result);
        return result;
    });
}
