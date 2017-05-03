---
title: Static site cd
layout: Post
tagline: Continuous deployment for a static website with git, rrsync and ssh
tags: rsync, ssh, ci
---

This post will walkthrough a basic [continuous delivery](https://en.wikipedia.org/wiki/Continuous_delivery) solution using 
tooling that is mostly [free as in gratis](https://en.wikipedia.org/wiki/Gratis_versus_libre#Gratis). It is suitable for simple static websites, currently I am using it 
in with this blog.

The main technical requirement for this *cd* solution is that from every vcs commit made, the project is able to build, test and deploy if custom conditions are met. In the case of this blog, changes or additions to markdown files, will build the website automatically. If changes are made on a particular branch like *master* and the build/test passed, it would then be automatically deployed to live.
 
The only real financial cost of this solution is the static web host itself. If this will be a low traffic website, these days lots of vps provider options exist for about *$5* a month. The main requirement is root access on a trusted linux distro.

Lets highlight the basic top level workflow of this solution:

```
VCS
 │
 └── VCS Triggers ──────┐ 
                        │
 ┌── CI Build & Test ◀──┘
 │
Deployment
 │
 └──▶ Web Http Host
```

I have chosen to use the following technologies:

#### VCS

- [github](https://github.com) the widely popular commercial platform built on top of [git](https://git-scm.com). It offers free accounts for opensource repositories and has [created integrations](https://github.com/integrations) that can trigger services like `ci` systems.

#### CI 

- [travis](https://travis-ci.org) another popular solution that has an opensource teir that offers [free as in gratis](https://en.wikipedia.org/wiki/Gratis_versus_libre#Gratis) linux runners which can be configured from a `*.yml` file.

### Deployment

- [rsync](https://rsync.samba.org) is a well known and battle tested gnu tool that provides fast incremental file transfer.

- [openssh](https://www.openssh.com) is the industry trusted secure network protocol. This can be used to deploy build artifacts from the ci securely from the ci.

#### Web Http Host

- [nginx](https://www.nginx.com/resources/wiki) is an efficient and widely used http server that easily suites the requirements of a static web host.

With these choices the workflow now looks like:

```
git (Commit & Push)
     │
     └── Github (Travis Integration) ──────────┐ 
                                               │
     ┌── (Build / Test / Deploy) ◀── Travis ◀──┘
     │
  (ssh & rrsync)
     │
     └──▶ Nginx on a Linux VPS
```

### Configuration tutorial

This post assumes some experience using a vps, ssh, git, github and travis-ci. There is also some prerequisites that you need to have ready before starting.

* Something to deploy, something like a blog such as this ;)
* A Linux vps with root access
* A github account and repository created
* Travis ci account and repository added

Lets get started:

1. Create a new ssh key without a passphrase, you may have used ssh-keygen before:

```shell
ssh-keygen -t rsa -b 4096
```

To have no passphrase, just hit enter when being prompted for a passphrase instead of inputting one. Remember the location of the ssh key you generate. This key will be used for the travis ci later.

2. Install the Travis cli client

Follow the official [installation](https://github.com/travis-ci/travis.rb#installation) docs.

3. Configure Travis ci with your repository

Using the cli tool you can initialize the required configuration based on your dependencies, for this blog it requires node so just provide that to the `init` command:

```shell
travis init node
```

Optionally you can follow their in [documention](https://docs.travis-ci.com/user/getting-started) which have step by step guides.

4. Encrypt private key for travis

Use the `travis encrypt-file` command on your key:

```shell
travis encrypt-file ${PRIVATE_KEY_PATH} --add
```

By using the `--add` option it will automatically append the `.travis.yml` file with the required configuration for travis to decrypt it service side.  You should see this new configuration added to your `before_install` block, and example being:

```yml
before_install:
- openssl aes-256-cbc -K $encrypted_876346874f8a6_key -iv $encrypted_876346874f8a6_iv
  -in ssh_key.enc -out ssh_key -d
```

5. Commit the .travis.yml config and encrypted ssh key to git 

Now we have the key encrypted and travis configured, you now can add the encrypted `ssh_key.enc` to git, example:

```shell
git add .travis.yml
git add ${ssh_key.enc}
git commit -m 'added travis config and encrypted deployment key'
git push origin HEAD
```

6. Setup the Host server

Any linux host is suitable where you can install the following dependencies:

* ssh
* rsync
* nginx

Most linux distros already come with `ssh` and `rsync` installed nginx docs are [available here](http://nginx.org/en/docs/install.html).

7. Add a new user on the Host server

For your server to receive the deployment of the built files from travis, create a new user that you can restrict access to. In an debain linux distro the command would be something like:

```shell
sudo adduser --gecos 'rsync user for the awesome website' --disabled-password ${RSYNC_USERNAME}
```

8. Give rsync ssh access to travis

With this new user, you can add the public key for the private one you just encrypted to `authorized_keys` of the new user. Best practice, is to use `ssh-copy`, example:

```shell
ssh-copy-id -i /home/user/.ssh/ssh_key.pub ${hostname} -f
```

9. Setup rrsync

No that is not a typo, `rrsync` is a script that is distributed with `rsync` that allows further restricts the ssh user. It will limit the access of the `ci` to only deploy the site files in a particular location. The script is generally distributed with debian & ubuntu distros, otherwise you can check it out [here](https://ftp.samba.org/pub/unpacked/rsync/support/rrsync).

I have found that it was not setup on an ubuntu system, you can do so easily by the following commands to make unzip and make it executable:

```shell
sudo cp /usr/share/doc/rsync/scripts/rrsync.gz /usr/local/bin/
sudo gzip -d /usr/local/bin/rrsync.gz
sudo chmod 755 /usr/local/bin/rrsync
```

10. Restrict the ssh command with rrsync and options

In the ssh config file eg, `/home/<user>/.ssh/config` we can prefix the public key for the travis ci deployment that was adding from the `ssh-copy-id` before. The prefix needs to be `command="<options>"`, for example:

```shell
command="/usr/local/bin/rrsync ${DEPLOY_FOLDER}",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding ssh-rsa ${DEPLOYMENT_KEY}
```

`DEPLOY_FOLDER` is the location rsync will copy the files to.

11. Add a rsync deployment command for travis

Rsync has an arsenal of options for transfering files, it's worth reading up on it here with the [man rsync](https://ss64.com/bash/rsync_options.html).

An example command similar to the one I am using for the blog would be:

```shell
rsync -e "ssh -oStrictHostKeyChecking=no -i ${PRIVATE_KEY} -p 776" --delete -avr ${DEPLOY_FOLDER} ${DEPLOY_HOST}@${DEPLOY_USER}
```

This command can be added to the travis `deploy` block of the `.travis.yml`. 
Read more on what you can do with this block [here](https://docs.travis-ci.com/user/deployment).

13. Nginx configuration for serving static content

Nginx has some official docs on [serving static content](https://www.nginx.com/resources/admin-guide/serving-static-content). Explaining how to 
configure nginx is out of the scope of this post it can be done from a small 
json like config file.

14. Try out the solution by committing changes and watching it build, test and deploy :)

#### SSH & Security

This setup is far from a [TNO](https://en.wikipedia.org/wiki/Trust_no_one_
(Internet_security)) security model. Not having a passphrase and 
putting the encrypted private key in a public git repository might sound 
risky. Lets be aware of what and who we are trusting with this setup:

* `Travis CI` will have the ability to decrypt the private ssh key for access
 to the deployment location of the ssh user we setup. We are trusting their 
 platform and their team who has access to this part of the system.

* The encryption method for the private key itself is done with the [travis-ci tool](https://github.com/andredumas/docker-travis-ci-cli) we are trusting that this tool was built with security and it's user's in mind.

* `rrsync` & `ssh` we have restricted the ssh user to access only what it 
needs. These tools are widely used and battle tested throughout the industry.
 As long as security updates are applied there should be no issue using them.

#### Overview

Although this setup is quite flexible and composable, it does not offer advanced management over the deployment lifecycle or staging environments. If you need these features without a lot of custom scripting, something like [dokku](https://github.com/dokku/dokku) maybe more suitable.

Interchanging the technology choices I made here is more than possible. Using `ssh` *"securely"* with `rrsync` like we have done here is possible with ci systems that support encrypted environment variables. I have used similar configuration successfully with [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines), and [Appveyor](https://www.appveyor.com/).

Although the use case for this is specific to a simple blog or some kind of *nightly build* setup, composing a solution with these tools like this can show you a lot about what is possible, enjoy.
