---
title: ssh `Host` configuration
layout: Post
tagline: Configure ssh for multiple hosts
tags: git, ssh
--------------

If you have found yourself committing to multiple git remotes, connecting to multiple remote servers with ssh, you may find typing all the necessary arguments tedious. In this post I will show how you can use ssh configuration to make these tasks fair less painful. After this you will be able to do the following:

Git clone using custom names for specific keys and repository urls:

```shell
git clone awesome-key:awesome/project.git
```

*vs doing this manually with*

```shell
GIT_SSH_COMMAND="ssh -i ~/.ssh/awesome_private_key" git clone git@github.com:awesome/project.git
# Note GIT_SSH_COMMAND only works in from Git version 2.3.0 :(
```

Another example is to use ssh all with a pre-configured port, url and user in a single argument:

```shell
ssh awesome-server
```

*vs manually specifying all this every time*

```shell
ssh -i ~/.ssh/awesome_private_key -p 4443 fred@10.35.22.41
```

To make these above commands possible, you first need to know where the ssh configuration is in the system. Ssh uses configuration files in a simple order of configuration specificity.

Firstly the global config:

```shell
/etc/ssh/ssh_config
```

Next the user specific config file:

```shell
~/.ssh/config
```

Lets start off showing how to use different keys for different git remote hosts. Lets say you may want to contribute to sourcecode on gitlab and github and want to automatically use a different private key for each.

Append this to your ~/.ssh/config file:

```yml
Host gitlab
    HostName gitlab.org
    User git
    IdentityFile ~/.ssh/gitlab

Host github
    HostName github.org
    User git
    IdentityFile ~/.ssh/github
```

The configuration is simple yml where you can specify configuration by `Host`. This Host key name is acts as the alias for your ssh commands and those used by git. For example to clone a gitlab project you can now use this:

```shell
git clone gitlab:gitlab-org/gitlab-project.git
```

This can also help you with having ssh keys on the same git host. So if we had another gitlab account, just add another `Host` with a different alias.

```yml
Host gitlab-work
    HostName gitlab.org
    User git
    IdentityFile ~/.ssh/gitlab-work

Host gitlab
    HostName gitlab.org
    User git
    IdentityFile ~/.ssh/gitlab
```

You can also use patterns for Host like `Host *` that would apply configuration to all Hosts.

Now lets save more keystrokes with your ssh logins. A lot of ssh configurations may require a specific port, user and a specific private key. So in the same ssh config file you can add everything as further properties to the host:

```shell
Host myawesomeserver
    HostName 141.39.44.35
    User alex
    IdentityFile ~/.ssh/myawesomeserver
    Port 233
```

You can now login in one line with:

```shell
ssh myawesomeserver
```

For more detailed info and more ssh config options, you can review the man for [ssh_config - OpenSSH SSH client configuration files](http://linux.die.net/man/5/ssh_config).

So thats about it, with custom `Host` names you can now configure your ssh connections with alias' that are easier to remember and type.