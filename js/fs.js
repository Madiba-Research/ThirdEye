
Interceptor.attach(Module.findExportByName("libc.so", "open"), {
    onEnter: function (args) {
        //console.log("Hi:"+args[0].readUtf8String())
        this.name = args[0].readUtf8String();
        this.flag = parseInt(args[1]);
        if (this.name.startsWith("/storage") && !this.name.startsWith("/storage/emulated/0/Android/obb") && !this.name.startsWith("/storage/emulated/0/Android/data")) {

            console.log("--->" + this.name);
        }
    },
    onLeave(retval) {
        if (this.name.startsWith("/storage") && !this.name.startsWith("/storage/emulated/0/Android/obb") && !this.name.startsWith("/storage/emulated/0/Android/data")) {
            Files.set(parseInt(retval), this.name);
            send('{"fs":{"function":"open","fd":' + parseInt(retval) + ',"path":"' + this.name + '","flag":"' + this.flag + '"}}');
        }
    }
});

Interceptor.attach(Module.findExportByName("libc.so", "remove"), {
    onEnter: function (args) {
        this.name = args[0].readUtf8String();
    },
    onLeave(retval) {
        if (this.name.startsWith("/storage")) {
            send('{"fs":{"function":"remove","status":' + parseInt(retval) + ',"path":"' + this.name + '"}}');
        }
    }
});

Interceptor.attach(Module.findExportByName("libc.so", "rename"), {
    onEnter: function (args) {
        this.src = args[0].readUtf8String();
        this.dst = args[1].readUtf8String();
    },
    onLeave(retval) {
        if (((this.src.startsWith("/storage") && !this.src.startsWith("/storage/emulated/0/Android/obb") && !this.src.startsWith("/storage/emulated/0/Android/data")) || (this.dst.startsWith("/storage") && !this.dst.startsWith("/storage/emulated/0/Android/obb") && !this.dst.startsWith("/storage/emulated/0/Android/data"))) && parseInt(retval) == 0) {
            send('{"fs":{"function":"rename","source":"' + this.src + '","destination":"' + this.dst + '"}}');
        }
    }
});


Interceptor.attach(Module.findExportByName("libc.so", "read"), {
    onEnter: function (args) {
        this.fd = parseInt(args[0])
        this.addr = args[1]
    },
    onLeave(retval) {
        var len = parseInt(retval);
        if (len != 0xFFFFFFFF && len != 0x0 && Files.has(this.fd)) {
            send('{"fs":{"function":"read","fd":' + this.fd + ',"path":"' + Files.get(this.fd) + '","data":"' + arrayBufferToBase64(Memory.readByteArray(this.addr, len)) + '"}}');
        }
    }
});

Interceptor.attach(Module.findExportByName("libc.so", "close"), {
    onEnter: function (args) {
        if (Files.has(this.fd)){
            send('{"fs":{"function":"close","fd":' + parseInt(retval) + '"}}');
            Files.delete(parseInt(args[0]));
        }
    }
});

Interceptor.attach(Module.findExportByName("libc.so", "write"), {
    onEnter: function (args) {
        this.fd = parseInt(args[0])
        this.addr = args[1]
    },
    onLeave(retval) {
        var len = parseInt(retval);
        if (len != 0xFFFFFFFF && Files.has(this.fd)) {
            send('{"fs":{"function":"write","fd":' + this.fd + ',"path":"' + Files.get(this.fd) + '","data":"' + arrayBufferToBase64(Memory.readByteArray(this.addr, len)) + '"}}');
        }
    }
});
