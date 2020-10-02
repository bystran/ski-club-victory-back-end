'use strict';


/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */


module.exports = {
  findAll: async (ctx) => {
    const news = await strapi.query('fbnews').find({_sort: 'id:asc'});
    const img_of_the_week = await strapi.query('fbphoto').findOne({})
    const media = await strapi.query('fbmedia').find({_sort: 'id:asc'});
    return ctx.send({
      media, news, img_of_the_week
    });
  }
};
