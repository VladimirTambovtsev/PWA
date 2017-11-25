const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const serviceAccount = require("./pwapplication-firebase-key.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://pwapplication-95a6f.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest((req, res) => {
	cors(req, res, () => {
		admin.database().ref('posts').push({
			id: req.body.id,
			title: req.body.title,
			location: req.body.location,
			image: req.body.image
		}).then(() => {
			webpush.setVapidDetails('mailto:tambovcev99@mail.ru', 
				'BDih4VytgrcI0p4xtqFQMpHeFQeNHK-DAvksvletcONyzrpxfRvnEaU0aOoso4wgID9HF1_ZfoW2g_rU_x1zmX0', 
				'zY0tvDBm4JQA46UuBGA1MZ89km0wt9tgs1fDBgfaGcM');
			return admin.database().ref('subscriptions').once('value');
		})
		.then(function(subscriptions) { 
			subscriptions.forEach(function(sub) {
				var pushConfig = {
					endpoint: sub.val().endpoint,
					keys: {
						auth: sub.val().keys.auth,
						p256dh: sub.val().keys.p256dh 
					}
				};

				webpush.sendNotification(pushConfig, JSON.stringify({
						title: 'New Post',
						content: 'New post added',
						openURL: '/help'  // redirect to this page on notification
					}))
					.catch(function(err) {
						console.log(err);
					});
			});
			res.status(201).json({message: 'Data stored!', id: req.body.id});
		})
		.catch((err) => {
			res.status(500).json({error: err});
		});
	});
});
