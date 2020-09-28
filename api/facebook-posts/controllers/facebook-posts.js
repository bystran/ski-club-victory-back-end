'use strict';


/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */


module.exports = {
  findAll: async (ctx) => {
    const news = await strapi.query('fbnews').find({});
    const img_of_the_week = await strapi.query('fbphoto').findOne({})
    const media = await strapi.query('fbmedia').find({});
    return ctx.send({
      media, news, img_of_the_week
    });
  }
};
