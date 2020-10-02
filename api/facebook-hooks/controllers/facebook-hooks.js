'use strict';

const { default: createStrapi } = require("strapi");

module.exports = {
  verify: async (ctx) => {
    const query = ctx.request.query
    console.log(query);
    console.log(process.env.FB_HOOK_TOKEN);
    if(query["hub.verify_token"] === process.env.FB_HOOK_TOKEN
      && query["hub.mode"] === 'subscribe' && query['hub.challenge']){
        console.log('true')
        return ctx.send(query['hub.challenge']);

    };

  },
  notify: async (ctx) => {
    strapi.config.functions.facebook.updateAll();

    ctx.status = 200;
    ctx.message ='OK'

    return ctx.send({});
  }
}
