module.exports = {
  apps: [
    {
      name: 'dailyguide-api',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: ['dist'],
      watch_delay: 5000,
      env: {
        NODE_TYPE: 'slave',
      },
    },
    {
      name: 'dailyguide-api-notification',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: ['dist'],
      watch_delay: 5000,
      env: {
        NODE_TYPE: 'notification',
      },
    },
  ],
};
