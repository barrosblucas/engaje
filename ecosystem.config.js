module.exports = {
  apps: [
    {
      name: 'engaje-api',
      script: 'apps/api/dist/main.js',
      cwd: '/home/thanos/engaje',
      env_file: '/home/thanos/engaje/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'engaje-web',
      script: 'npm',
      args: 'run start',
      cwd: '/home/thanos/engaje/apps/web',
      env_file: '/home/thanos/engaje/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
