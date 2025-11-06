const admin = require('firebase-admin');
const FcmToken = require('../database/models/fcmToken');

const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const fcmTokenDocs = await FcmToken.find({ userId: userId });

    if (fcmTokenDocs.length === 0) {
      console.log(`No FCM tokens found for user ${userId}. Skipping push notification.`);
      return;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data, // Custom data payload
      tokens: fcmTokenDocs.map(doc => doc.fcmToken),
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log('Successfully sent message:', response);

    // Handle invalid tokens
    if (response.responses) {
      for (let i = 0; i < response.responses.length; i++) {
        const resp = response.responses[i];
        if (!resp.success && resp.exception && resp.exception.code === 'messaging/registration-token-not-registered') {
          // Remove the invalid token from your database
          const invalidToken = fcmTokenDocs[i].fcmToken;
          await FcmToken.deleteOne({ fcmToken: invalidToken });
          console.log(`Removed invalid FCM token: ${invalidToken} for user ${userId}`);
        }
      }
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

module.exports = { sendPushNotification };
