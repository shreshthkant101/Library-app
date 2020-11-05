import * as firebase from 'firebase';
require('@firebase/firestore');

var firebaseConfig = {
    apiKey: "AIzaSyBk9MZrXuSgFVQi3vpDVhbAodEKBrn-7f4",
    authDomain: "library-app-5f478.firebaseapp.com",
    databaseURL: "https://library-app-5f478.firebaseio.com",
    projectId: "library-app-5f478",
    storageBucket: "library-app-5f478.appspot.com",
    messagingSenderId: "972923164556",
    appId: "1:972923164556:web:240c221989cee9a287e8a9"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();