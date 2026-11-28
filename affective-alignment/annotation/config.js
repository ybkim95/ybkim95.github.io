/* Study settings. Leave `firebase` empty until the IRB has approved the study: the page then runs as a preview and sends
   nothing. After approval, set `firebase` to the web app settings of the study team's Firebase project (backend/README.md)
   and the Prolific links: `completionUrl` (rating task), `completionUrlDecide` and `screenOutUrl` (decision task). Each
   answer is then saved under /aa_ratings as it is given. */
window.STUDY_CONFIG = {
  firebase: null,
  completionUrl: "",
  completionUrlDecide: "",
  screenOutUrl: "",
  version: "annotation-v2.1",
};
