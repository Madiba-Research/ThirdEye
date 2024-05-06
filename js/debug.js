setTimeout(function () {
    Java.perform(function () {
        var androidSettings = ['adb_enabled'];
        var settingGlobal = Java.use('android.provider.Settings$Global');

        settingGlobal.getInt.overload('android.content.ContentResolver', 'java.lang.String').implementation = function (cr, name) {
            if (name == androidSettings[0]) {
                return 0;
            }
            var ret = this.getInt(cr, name);
            return ret;
        }

        settingGlobal.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function (cr, name, def) {
            if (name == (androidSettings[0])) {
                return 0;
            }
            var ret = this.getInt(cr, name, def);
            return ret;
        }

        settingGlobal.getFloat.overload('android.content.ContentResolver', 'java.lang.String').implementation = function (cr, name) {
            if (name == androidSettings[0]) {
                return 0;
            }
            var ret = this.getFloat(cr, name);
            return ret;
        }

        settingGlobal.getFloat.overload('android.content.ContentResolver', 'java.lang.String', 'float').implementation = function (cr, name, def) {
            if (name == androidSettings[0]) {
                return 0;
            }
            var ret = this.getFloat(cr, name, def);
            return ret;
        }

        settingGlobal.getLong.overload('android.content.ContentResolver', 'java.lang.String').implementation = function (cr, name) {
            if (name == androidSettings[0]) {
                return 0;
            }
            var ret = this.getLong(cr, name);
            return ret;
        }

        settingGlobal.getLong.overload('android.content.ContentResolver', 'java.lang.String', 'long').implementation = function (cr, name, def) {
            if (name == androidSettings[0]) {
                return 0;
            }
            var ret = this.getLong(cr, name, def);
            return ret;
        }

        settingGlobal.getString.overload('android.content.ContentResolver', 'java.lang.String').implementation = function (cr, name) {
            if (name == androidSettings[0]) {
                var stringClass = Java.use("java.lang.String");
                var stringInstance = stringClass.$new("0");

                console.log('[+]Global.getString(cr, name) Bypassed');
                return stringInstance;
            }
            var ret = this.getString(cr, name);
            return ret;
        }

    });
}, 0);
