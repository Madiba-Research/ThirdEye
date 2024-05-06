setTimeout(function () {
    Java.perform(function () {
        var RootPackages = ["com.topjohnwu.magisk"];
        var RootBins = ["su", "busybox"];

        Java.use("android.app.ApplicationPackageManager").getPackageInfoAsUser.implementation = function (packageName, flags, userId) {
            if (RootPackages.indexOf(packageName) > -1) {
                packageName = "fake.fake.fake.fake.fake.package";
            }
            return this.getPackageInfoAsUser(packageName, flags, userId);
        } //Android 11
        Java.use("android.app.ApplicationPackageManager").getPackageInfo.overload('java.lang.String', 'int').implementation = function (packageName, flags) {
            if (RootPackages.indexOf(packageName) > -1) {
                packageName = "fake.fake.fake.fake.fake.package";
            }
            return this.getPackageInfo(packageName, flags);
        }
        // Java.use('android.content.pm.PackageManager').getPackageInfo.overload('java.lang.String', 'int').implementation = function (packageName, flags) {
        //     console.log("-------------------------")
        //     console.log(packageName);
        //     if (RootPackages.indexOf(packageName) > -1) {
        //         packageName = "fake.fake.fake.fake.fake.package";
        //     }
        //     return this.getPackageInfo(packageName, flags);
        // }
        Java.use('java.lang.Runtime').exec.overload('[Ljava.lang.String;').implementation = function (cmd) {
            console.log(cmd)
            if (cmd[0] == "which" ||cmd[0] == "su" || cmd[0] == "mount" || RootBins.indexOf(cmd[0]) || RootBins.indexOf(cmd[1])) {
                return this.exec([]);
            }
            return this.exec(cmd);
        }
        Java.use('java.lang.String').contains.overload('java.lang.CharSequence').implementation = function (charSequence) {
            if (charSequence.toString() == "test-keys") {
                return false;
            }
            return this.contains(charSequence);
        }
        Java.use('java.lang.Runtime').exec.overload('java.lang.String').implementation = function (command) {
            // console.log(command)

            if (command.match(/.*which\s.*su/) || command.match(/mount/)) {
                console.log(command)
                return this.exec(Java.use("java.lang.String").$new("which D4my").toString());
            }

            if (command.match(/su/)) {
                return this.exec(Java.use("java.lang.String").$new("D4my").toString());
            }
            // if (command.match(/getprop/)) {
            //     return this.exec(command + " | grep -v ro.debuggable");
            // }
            return this.exec(command);
        }
        Java.use('java.io.File').$init.overload('java.lang.String', 'java.lang.String').implementation = function (path, file) {
            if (["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"].includes(file)) {
                return this.$init(path, Java.use("java.lang.String").$new("D4my").toString());
            } else {
                return this.$init(path, file);
            };
        }
        Java.use('java.io.File').$init.overload('java.io.File', 'java.lang.String').implementation = function (path, file) {
            if (["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"].includes(file)) {
                return this.$init(path, Java.use("java.lang.String").$new("D4my").toString());
            } else {
                return this.$init(path, file);
            };
        }
        Java.use('java.io.File').$init.overload('java.lang.String').implementation = function (file) {
            if (["/data/local/su",
                "/data/local/bin/su",
                "/data/local/xbin/su",
                "/sbin/su",
                "/su/bin/su",
                "/system/bin/su",
                "/system/bin/.ext/su",
                "/system/bin/failsafe/su",
                "/system/sd/xbin/su",
                "/system/usr/we-need-root/su",
                "/system/xbin/su/su",
                "/system/app/Superuser.apk",
                "/cache/su",
                "/system/xbin/busybox",
                "/system/bin/magisk",
                "/data/su",
                "/dev/su"
            ].includes(file)) {
                return this.$init(Java.use("java.lang.String").$new("D4my").toString());;
            } else {
                return this.$init(file)
            };
        }
        try {
            Java.use('android.location.Location').isMock.implementation = function () {
                return false;
            }
            Java.use('android.location.Location').isFromMockProvider.implementation = function () {
                return false;
            }
        } catch (_) { }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function (args) {
            this.path = Memory.readCString(args[0]).split("/");
        },
        onLeave: function (retval) {
            var path = this.path;
            if ((["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"].indexOf(path[path.length - 1]) > -1)) {
                retval.replace(0x0);
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "system"), {
        onEnter: function (args) {
            this.cmd = Memory.readCString(args[0]);
        },
        onLeave: function (retval) {
            var cmd = this.cmd;
            if (cmd == "su" || cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1) {
                retval.replace(0x0);
            }
        }
    });
}, 1);