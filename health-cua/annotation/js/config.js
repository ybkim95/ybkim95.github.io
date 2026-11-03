// Firebase web app settings of the study team's shared project (CoDaS, ivory-plane-406700). They identify the project and are
// not secrets; access is controlled by database.rules.json, and every path of this study is under ROOT. ?demo runs the demo
// (invented cases, this browser only); on localhost, ?emulator uses the Auth and Database emulators.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBIorDH--HXJolxqx0NdF8MWO0wmO0_a4A',
  authDomain: 'ivory-plane-406700.firebaseapp.com',
  databaseURL: 'https://ivory-plane-406700-default-rtdb.firebaseio.com',
  projectId: 'ivory-plane-406700',
  appId: '1:360125182471:web:52f8e72c2c4994686530a2',
};
export const ROOT = 'hcua_supervision';
// Study B (blinded episode review, validity.html) keeps its own root; the two studies never read each other's paths.
export const VALIDITY_ROOT = 'hcua_validity';
// Study A' (task review, review.html) keeps its own root too.
export const REVIEW_ROOT = 'hcua_task_review';
