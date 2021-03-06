/* exported init */

const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Meta = imports.gi.Meta;
const Workspace = imports.ui.workspace.Workspace;

const Self = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Self.imports.convenience;

class Extension {
	constructor() {
		this.settings = Convenience.getSettings();
	}

	_toggleApplication() {
		if (!this.cached_window_actor || !this.cached_window_actor.metaWindow || !this.cached_window_actor.metaWindow.get_workspace) {
			let windows = global.get_window_actors().filter(actor => {
				return actor.metaWindow.get_wm_class() === this.settings.get_string("wm-class");
			});

			// Alacritty has not been launched, launching new instance
			if (!windows.length) {
				imports.misc.util.trySpawnCommandLine(this.settings.get_string("app-path"));
				return;
			}

			this.cached_window_actor = windows[0];
		}

		let win = this.cached_window_actor.metaWindow;
		let focusWindow = global.display.focus_window;

		// application is active, hiding
		if (win === focusWindow) {
			win.minimize();
			return;
		}

		// application not active, activating
		let activeWorkspace = global.workspace_manager.get_active_workspace();
		let currentMonitor = activeWorkspace.get_display().get_current_monitor();
		let onCurrentMonitor = win.get_monitor() === currentMonitor;
		if (!win.located_on_workspace(activeWorkspace)) {
			win.change_workspace(activeWorkspace);
			onCurrentMonitor || win.move_to_monitor(currentMonitor);
		} else if (win.minimized && !onCurrentMonitor) {
			win.move_to_monitor(currentMonitor);
		}
		activeWorkspace.activate_with_focus(win, global.get_current_time());
	}

	enable() {
		this.cached_window_actor = null;
		let ModeType = Shell.hasOwnProperty('ActionMode') ? Shell.ActionMode : Shell.KeyBindingMode;
		Main.wm.addKeybinding('toggle-key', this.settings, Meta.KeyBindingFlags.NONE, ModeType.NORMAL | ModeType.OVERVIEW, this._toggleApplication.bind(this));

		// disable animation when hiding application
		if (Main.wm._shouldAnimateActor) {
			this._shouldAnimateActor_bkp = Main.wm._shouldAnimateActor;
			Main.wm._shouldAnimateActor = (actor, types) => {
				if (actor.metaWindow && actor.metaWindow.get_wm_class() === this.settings.get_string("wm-class")) return false;
				return this._shouldAnimateActor_bkp.call(Main.wm, actor, types);
			}
		}

		// hide application from workspace overview
		if (Workspace.prototype._isOverviewWindow) {
			this._isOverviewWindow_bkp = Workspace.prototype._isOverviewWindow;
			Workspace.prototype._isOverviewWindow = (win) => {
				if (win.get_wm_class && win.get_wm_class() === this.settings.get_string("wm-class")) return false;
				return this._isOverviewWindow_bkp.call(Workspace, win);
			}
		}
	}

	disable() {
		Main.wm.removeKeybinding('toggle-key');
		this.cached_window_actor = null;

		if (this._shouldAnimateActor_bkp) {
			Main.wm._shouldAnimateActor = this._shouldAnimateActor_bkp;
			this._shouldAnimateActor_bkp = null;
		}

		if (this._isOverviewWindow_bkp) {
			Workspace.prototype._isOverviewWindow = this._isOverviewWindow_bkp;
			this._isOverviewWindow_bkp = null;
		}
	}
}

function init() {
	return new Extension();
}
