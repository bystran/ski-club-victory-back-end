const axios = require('axios');

const url = 'https://graph.facebook.com/v8.0/172612366211657/feed';
const fields = 'id,message,permalink_url,full_picture,picture,message_tags,status_type,created_time,attachments{media_type,type,media,description,url,unshimmed_url,target,description_tags,title, subattachments}';


const deleteSavedNews = async () => {
  console.log('Deleting news');
  const news = await strapi.query('fbnews').delete({id_gte: 0});
  console.log('News are deleted.')
  return news;
}
const getFBData = async (limit) => {
  const {data:{data}} = await axios.get(url, {
    params: {
      fields,
      limit,
      access_token:process.env.FB_ACCESS_TOKEN
    }
  })


  return data
}

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
const find_post_type = (data, type, type2) => {
  return data.filter( post =>
    post.status_type === type || post.status_type === type2
  )
}
const extractMedia = (data) => {
  const photo_posts = find_post_type(data, "added_photos", "added_video" );
  return photo_posts.reduce((acc, post)=>{
    post.attachments.data.forEach(a => {
      if(a.subattachments){
        a.subattachments.data.forEach(subatt=>acc.push(subatt.media))
      }else{
        acc.push(a.media)
      }
    });
    return acc
  }, []);
}

const first_with_ht = (data, ht) =>{
  return data.filter(post =>
      post.message_tags &&
      post.message_tags.find( mt =>
          mt.name === ht
      )
  )[0]
}

module.exports = {

  updatePhotoOfTheWeek: async (inData) => {
    const rollbackPhoto = await strapi.query('fbphoto').delete({id_gte: 0});
    try{
      let data;
      if(!inData){
        data = await getFBData(100);
      }else{

        data = inData
      }
      const photoOfTheWeek = first_with_ht(data, "#fotkatyzdna");
      await strapi.query('fbphoto').create(photoOfTheWeek);
    } catch (error) {
      console.log(error);
      await strapi.query.create(rollbackPhoto[0]);
    }

  },
  updateNews: async (inData) => {
    const rollBackNews = await deleteSavedNews();
    console.log('Updating news...');
    try {
      let data;
      if(!inData){
        data = await getFBData(20);
      }else{
        data = inData
      }
      const fb_news = extract_news(data);
      fb_news.forEach( async fbn =>{
          await strapi.query('fbnews').create(fbn);
      });


    } catch (error) {
      console.log(error);
      rollBackNews.forEach(async n=>await strapi.query('fbnews').create(n))
    }


  },
  updateMedia: async (inData) => {
    const rollbackMedia = await strapi.query('fbmedia').delete({id_gte: 0, _limit:5000})
    console.log('Updating media...');
    try{
      let data;

      if(!inData){
        data = await getFBData(50);
      }else{
        data = inData;
      }

      const media = extractMedia(data);

      media.slice(0, 100).forEach(async med=>{
        await strapi.query('fbmedia').create({
          media: med
        })
      })


    } catch (error) {
      console.log(error);
      rollbackMedia.forEach(async med => {
        await strapi.query('fbmedia').create(med);
      })
    }
  },
  updateAll: async () => {
    const post_limit = 50;
    const data = await getFBData(post_limit);
    const latest_post = data[0]
    const latest_post_from_db = await strapi.query('fbnews').findOne({created_time:latest_post.created_time});
    if(!latest_post_from_db){
      module.exports.updatePhotoOfTheWeek(data);
      module.exports.updateNews(data);
      module.exports.updateMedia(data);
      console.log('All resources have been updated');
    }

  },
}
