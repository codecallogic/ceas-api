module.exports = {
  apps : [{
    name   : "server",
    script : './server.js',
    interpreter: "~/.nvm/versions/node/v18.18.2/bin/node"  // Explicitly set Node.js version for PM2
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
      'post-deploy' : 'source ~/.nvm/nvm.sh && nvm use 16.20.2 && npm install --legacy-peer-deps && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    }
  }
};
