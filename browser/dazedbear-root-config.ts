import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import firebase from "firebase";
import firebaseConfig from "../configs/firebase.json";

// TODO: design a way to retrieve layout definition via context (site domain, path, cookie, device...)
// TODO: design remote config & local config (use remote as single source of truth? or use remote as OVERRIDE FIX?)
// TODO: modify layout definition directly? or find a way to active/inactive module via local/remote config?
// TODO: asset loader

const fetchRemoteConfigs = async () => {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const remoteConfig = firebase.remoteConfig();
  if (process.env.NODE_ENV === "development") {
    // cache time for remote config (ms), default is 12 hours
    remoteConfig.settings.minimumFetchIntervalMillis = 60000;
  }
  await remoteConfig.fetchAndActivate();
  return remoteConfig;
};

(async () => {
  const remoteConfig = await fetchRemoteConfigs();

  const layoutDefenition = document.querySelector("#single-spa-layout");
  const layoutData = {
    props: {},
    loaders: {},
  };
  const routes = constructRoutes(layoutDefenition, layoutData);
  const applications = constructApplications({
    routes,
    loadApp({ name }) {
      return System.import(name);
    },
  });
  const layoutEngine = constructLayoutEngine({ routes, applications });
  applications.forEach(registerApplication);
  layoutEngine.activate();
  start();
})();
