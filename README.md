# git-hook-CI
Simple script to setup automatic build and deployment of node applications based on code repository changes. Express server listens for web hooks from github and automatically pulls the new files, builds and deploy them. (Deploy only means that the build files will be copy to the public folder that is serving the application)

Requirements:
* The server needs to run on the machine that is also hosting the applications. 
* The config.json found in root needs to be populated.
* Before spinning up the git-hook server -> Clone the repository you want to enable automation for on the host machine.
* Setup web hooks on github (Assuming you have control of an enpoint that can be reached by github)

## config.json example
```javascript
{
    "port": 5001, // Just the port you want the express server to run at
    "name-of-repository": { // Important that the dictionary key matches the repository name
        "localPath": "/home/pi/Services/raspdus-client", // Path to the local git repository on the server machine (Where you want the automagic to happen)
        "buildCommand": "run-script build",  // This would be standard for the [Vue webpack boilerplate](https://github.com/vuejs-templates/webpack)
        "distributionFolder": "dist",  // This would be standard for the [Vue webpack boilerplate](https://github.com/vuejs-templates/webpack)
        "serviceWorkerFile":"make-sw.js", // Remove if not not applicable
        "destinationPath":"/var/www/raspdus" // Where to copy the distribution files from the build
    }
}
```

# Contact
Erik Andreas Larsen – [@grizzifrog](https://twitter.com/grizzlifrog) – eriklarsen.post@gmail.com
