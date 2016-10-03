---
title: i3 display management
date: 2016-08-02
layout: Post
tagline: Managing multiple displays with xrandr
tags: linux, i3
---

I have been enjoying the simplicity of the i3 window manager on linux. It's been an awakening to see how productive you can be in such a lightweight solution.

With i3 is being so minimalist there is going to be features you need to figure out yourself. In this post I'll go over one approach to managing, arranging and switching between multiple displays. So next time you want to plug into a projector or move to a new workstation you'll know how to get setup.

### xrandr is here to help

> xrandr is an official configuration utility to the RandR X Window System extension. It can be used to set the size, orientation or reflection of the outputs for a screen.

xrandr is configured through the command line and gives you control of your system's displays. Its quite useful to use `xrandr` to list the displays currently connected and their available resolutions eg:

```shell
> xrandr
Screen 0: minimum 8 x 8, current 3440 x 1440, maximum 32767 x 32767
eDP1 connected (normal left inverted right x axis y axis)
   3200x1800     59.98 +
   2880x1620     60.00
   2560x1440     60.00
   2048x1536     60.00
...
DP1 connected 3440x1440+0+0 (normal left inverted right x axis y axis) 797mm x 333mm
   3440x1440     59.97*+  49.99    29.99
   2560x1440     59.95
   2560x1080     60.00
   1920x1080     60.00    59.94
...
HDMI1 disconnected (normal left inverted right x axis y axis)
VIRTUAL1 disconnected (normal left inverted right x axis y axis)
```

Once you know the display ids like eDP1, DP1 you can use the xrandr command to do just about anything from rotation to gamma. Lets go through a few useful tasks:

### Setup your systray

On my first install of i3 the system tray was missing, i3 supports the system tray in i3bar natively. Unfortunately some applications depend on it being there like silentcast. To show the system tray you can use the option `tray_output` in your `bar` configurations.

```shell
bar {
    status_command i3status
    tray_output primary
    position top
}
```

The value to `tray_output` is the monitor name to display the tray on. The default i3 configuration gives you defaults to primary, however my system had no primary setup. xrandr is here to help:

```shell
>xrandr --listmonitors

Monitors: 1
 0: +*DP1 3440/797x1440/333+0+0  DP1
```

With your monitor identified its easy to assign it as the primary monitor.

```shell
xrandr --output DP1 --primary
```

On most distributions you should immediately see  it work with a wifi icon in the top right. To see what else you can do try `xrandr --help` or on the [arch wiki](https://wiki.archlinux.org/index.php/xrandr).

Although you can manage your display arrangement and positioning with direct commands I think a visual representation of the displays helps a lot. There are a few guis that do exactly this, I'll now be showing off [arandr](https://christian.amsuess.com/tools/arandr/).

```shell
sudo apt-get install arandr
```

When first launching arandr you should see a familiar representation of your displays.

![arandr](/assets/arandr.png)

You can drag and drop the arrangement of the screens, rotate and set their resolutions.

![arandr-outputs](/assets/arandr-outputs.png)

`arandr` is an especially gui for xrandr given it can generate a bash script of what you configure. This bash script will contain regular `xrandr` commands.

To demonstrate this, just click the `Save As` button to generate the bash script configuration. You now have a script to setup your displays for a particular scenario. So it may make sense to name them something like `home-displays.sh`, `work-displays.sh`.

### i3 modes

An easy way to add configuration to your system in i3 is to use [binding modes](https://i3wm.org/docs/userguide.html#binding_modes). Its a basic way to implement a prompt like option for an action that allows key modifiers in a new context. Just like most configurations have $mod+r for resize...

So for switching in-between the xrandr configurations you generate becomes as easy as binding to a key:

```bash
set $displayMode "Set display mode [w]ork [l]aptop [h]ome"
bindsym $mod+x mode $displayMode
mode $displayMode {
    bindsym w exec "\
                ~/.config/i3/scripts/work-displays.sh && \
                ~/.config/i3/scripts/dpi-96.sh"; \
                mode "default"
    bindsym h exec "\
                ~/.config/i3/scripts/home-display.sh && \
                ~/.config/i3/scripts/dpi-96.sh"; \
                mode "default"
    bindsym l exec "\
                ~/.config/i3/scripts/laptop-display.sh && \
                ~/.config/i3/scripts/dpi-192.sh"; \
                mode "default"

    bindsym Return mode "default"
    bindsym Escape mode "default"
}
```

This mode translates to the i3bar system similar to the standard resize mode:

![i3-display-mode](/assets/i3-display-mode.png)

So with tools like arandr and the i3 mode configuration it's easy to have a usable solution quickly. Knowing how mode works also shows how it would be useful for other common actions you do on your system.