Gnome Application Toggle
----------------------

Simple [gnome-shell](https://wiki.gnome.org/Projects/GnomeShell) (v3.38) extension to toggle an defined application easily.

Works under both `Wayland` and `X11`

Think of it like a simple "Scratchpad" window from i3.

Installation
------------
```
$ git clone https://github.com/acheronfail/gnome-application-toggle ~/.local/share/gnome-shell/extensions/toggle-application@acheronfail.com
```
and enable it in Extensions

Settings
-------------
Current settings are:

- `toggle-key`: change the hotkey which activates the application
- `wm-class`: the window WM Class to look for
- `app-path`: which binary to start if no window with `wm-class` is found

Once you change the settings (found in `~/.local/share/gnome-shell/extensions/toggle-application@acheronfail.com/schemas`) remember to re-compile the schemas:

```
$ glib-compile-schemas ./schemas/
```

Some Tips
---------------
To test if it works, you can an launch Application manually and use this command:
```
$ dbus-send --print-reply=literal --type=method_call --dest=org.gnome.Shell /org/gnome/Shell org.gnome.Shell.Eval string:"$(cat <<EOL
  global.get_window_actors().filter(actor => {
      return actor.metaWindow.get_wm_class() === '<WM_CLASS HERE>';
  })
EOL
)"
```

it should output something like the following:
```
[{"_windowType":0,"_notifyWindowTypeSignalId":57783}]
```
