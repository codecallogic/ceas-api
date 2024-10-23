module.exports = {
  apps : [{
    name   : "server",
    script: 'npm start'
  }],

  deploy : {
    production : {
      key  : 'Catsus.pem',
      user : 'ubuntu',
      host : '54.160.180.60',
      ref  : 'origin/master',
      repo : 'git@github.com:codecallogic/ceas-api.git',
      path : '/home/ubuntu/server',
      'pre-deploy-local': '',
      'post-deploy' : 'source ~/.nvm/nvm.sh && npm install --legacy-peer-deps && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    }
  }
};