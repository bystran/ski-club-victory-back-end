'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

const slugify = require('slugify');

module.exports = {
  beforeSave: async (model, attrs, options) => {
    if (options.method === 'insert' && attrs.Meno) {
      model.set('slug', slugify(attrs.Meno));
    } else if (options.method === 'update' && attrs.Meno) {
      attrs.slug = slugify(attrs.Meno);
    }
  },
};
