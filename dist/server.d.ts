import Hapi from "@hapi/hapi";
declare const init: () => Promise<Hapi.Server<Hapi.ServerApplicationState>>;
export default init;
