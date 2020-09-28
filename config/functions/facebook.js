const axios = require('axios');

const url = 'https://graph.facebook.com/v8.0/172612366211657/feed';
const fields = 'id,message,permalink_url,full_picture,picture,message_tags,status_type,created_time,attachments.limit(10){media_type,type,media,description,url,unshimmed_url,target,description_tags,title, subattachments}';


const deleteSavedNews = async () => {
  const news = await strapi.query('fbnews').find({});
  news.forEach(n => strapi.query('fbnews').delete({
    id: n.id
  }));
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
  updatePhotoOfTheWeek: async () => {
    const rollbackPhoto = await strapi.query('fbphoto').find({});
    strapi.query('fbphoto').delete({
      id: rollbackPhoto[0].id
    });
    try{
      const data = await getFBData(100);
      const photoOfTheWeek = first_with_ht(data, "#fotkatyzdna");
      strapi.query('fbphoto').create(photoOfTheWeek);
    } catch (error) {
      console.log(error);
      strapi.query.create(rollbackPhoto[0]);
    }

  },
  updateNews: async () => {
    console.log('fuctnion called!')
    const rollBackNews = await deleteSavedNews();

    try {
      const data = await getFBData(20);
      const fb_news = extract_news(data);
      fb_news.forEach( fbn =>{
          strapi.query('fbnews').create(fbn);
      });
    } catch (error) {
      console.log(error);
      rollBackNews.forEach(n=>strapi.query('fbnews').create(n))
      return null;
    }


  },
  updateMedia: async () => {
    try{
      const data = await getFBData(30);
      const media = extractMedia(data);
      const rollbackMedia = await strapi.query('fbmedia').find({})
      rollbackMedia.forEach(m => strapi.query('fbmedia').delete({
        id: m.id
      }))

      media.forEach(med=>{
        strapi.query('fbmedia').create({
          media: med
        })
      })

      return media;

    } catch (error) {
      console.log(error);
      rollbackMedia.forEach(med => {
        strapi.query('fbmedia').create(med);
      })
    }
  }
}
