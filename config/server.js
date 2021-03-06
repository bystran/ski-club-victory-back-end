module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url:  env('URL', 'https://api.skiclubvictory.sk'),
  admin: {
    url:"/dashboard",
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },

  },
  cron:{
    enabled: true,
  },
});
