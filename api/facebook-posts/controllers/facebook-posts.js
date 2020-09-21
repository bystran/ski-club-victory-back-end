'use strict';

const axios = require('axios');


/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const url = 'https://graph.facebook.com/v8.0/172612366211657/feed';
const fields = 'id,message,permalink_url,full_picture,picture,message_tags,status_type,created_time,attachments.limit(10){media_type,type,media,description,url,unshimmed_url,target,description_tags,title}';
const limit = '30'

const extract_news = (data) => {
  const filteredData = data.filter( post =>
    post.status_type !== 'tagged_in_photo' &&
    post.status_type !== 'approved_friend' &&
    post.status_type !== 'created_group' &&
    post.status_type !== 'created_note' &&
    post.status_type !== 'shared_story'
  )
  return filteredData.length > 6 ? filteredData.slice(0,6) : filteredData;


}
const first_with_ht = (data, ht) =>{
  return data.filter(post =>
      post.message_tags &&
      post.message_tags.find( mt =>
          mt.name === ht
      )
  )[0]
}
const find_post_type = (data, type) => {
  return data.filter( post =>
    post.status_type === type
  )
}

module.exports = {
  findAll: async (ctx) => {

    const {data:{data}} = await axios.get(url, {
      params: {
        fields,
        limit,
        access_token:process.env.FB_ACCESS_TOKEN
      }
    })


    const news = extract_news(data);
    const img_of_the_week = first_with_ht(data, "#fotkatyzdna")
    const photos = find_post_type(data, "added_photos")


    return ctx.send({
      news, img_of_the_week, photos
    });
  }
};
