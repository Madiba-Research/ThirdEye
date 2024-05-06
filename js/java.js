setTimeout(function () {
    Java.perform(function () {
        var socket = Java.use('java.net.Socket');
        var datagramSocket = Java.use('java.net.DatagramSocket');
        var socketChannel = Java.use('java.nio.channels.SocketChannel');
        var datagramChannel = Java.use('java.nio.channels.DatagramChannel');
        var SettingsSecure = Java.use('android.provider.Settings$Secure');
        // var InetSocketAddress = Java.use('java.net.InetSocketAddress');
        // var sock = Java.use("java.net.Socket");

        // // socket constructors

        // //new Socket()
        // sock.$init.overload().implementation = function(){
        //     console.log("new Socket() called");
        //     // return this.$init.overload().call(this);
        // }

        // // new Socket(inetAddress, port)
        // sock.$init.overload("java.net.InetAddress", "int").implementation = function(inetAddress, port){
        //     console.log("new Socket('"+inetAddress.toString()+"', "+port+") called");
        //     // return this.$init.overload("java.net.InetAddress", "int").call(this, inetAddress, port);
        // }

        // // // new Socket(inetAddress address, port, localInetAddress, localPort)
        // // sock.$init.overload("java.net.InetAddress", "int","java.net.InetAddress", "int").implementation = function(inetAddress, port, localInet, localPort){
        // //     console.log("new Socket(RemoteInet: '"+inetAddress.toString()+"', RemotePort"+port+", LocalInet: '"+localInet+"', LocalPort: "+localPort+") called");
        // //     this.$init.overload("java.net.InetAddress", "int","java.net.InetAddress", "int").call(this, inetAddress, port);
        // // }

        // // // new Socket(Proxy)
        // // sock.$init.overload("java.net.Proxy").implementation = function(proxy){
        // //     console.log("new Socket(Proxy: '"+proxy.toString()+"') called");
        // //     this.$init.overload("java.net.Proxy").call(this, proxy);
        // // }

        // // // new Socket(SocketImp)
        // // sock.$init.overload("java.net.SocketImpl").implementation = function(si){
        // //     console.log("new Socket(SocketImpl: '"+si.toString()+"') called");
        // //     this.$init.overload("java.net.SocketImpl").call(this, si);
        // // }

        // // // new Socket(host, port, localInetAddr, localPort)
        // // sock.$init.overload("java.lang.String", "int", "java.net.InetAddress", "int").implementation = function(host,port, localInetAddress, localPort){
        // //     console.log("new Socket(Host: '"+host+"', RemPort: "+port+", LocalInet: '"+localInetAddress+"', localPort: "+localPort+") called");
        // //     this.$init.overload("java.lang.String", "int", "java.net.InetAddress", "int").call(this, si);
        // // }

        var inetSockAddrWrap = Java.use("java.net.InetSocketAddress");
        try {
            var sfs2x = Java.use('sfs2x.client.SmartFox');
            sfs2x.connect.overload('java.lang.String', 'int').implementation = function (addr, port) {
                if (addr != null && port != -1) {
                    send('{"java":{"protocol":"tcp","function":"SmartFox::connect(String, int)","pid":' + Process.id + ',"address":"' + addr + ":" + port.toString() + '"}}');
                    //send(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()))
                }
                return this.connect(addr, port)
            };
        } catch (error) { }

        socket.connect.overload('java.net.SocketAddress', 'int').implementation = function (addr, timeout) {
            // var ret = this.connect(addr, timeout);
            if (addr.toString().endsWith(":443")) {
                console.log(addr.toString())
                var inetSockAddrImpl = inetSockAddrWrap.$new(proxy_addr4, 8080)
                var ret = this.connect(inetSockAddrImpl, timeout);
                console.log(addr.toString());
                } else if (addr.toString().endsWith("127.0.0.1:27042")){
                    var inetSockAddrImpl = inetSockAddrWrap.$new("127.0.0.1", 1)
                    send('{"java":{"protocol":"tcp","function":"Socket::connect(SocketAddress, int)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.getLocalSocketAddress() + '"}}');
                    var ret = this.connect(inetSockAddrImpl, timeout);
            } else {
                var ret = this.connect(addr, timeout);
            }

            // console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            if (JavaConnectionPool[addr.toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = [String(this.getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')].push(String(this.getLocalSocketAddress()).replace(/^.*\//, ''));
            }

            // JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = String(this.getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"tcp","function":"Socket::connect(SocketAddress, int)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };

        socket.connect.overload('java.net.SocketAddress').implementation = function (addr) {
            // var ret = this.connect(addr);
            if (addr.toString().endsWith(":443")) {
                var inetSockAddrImpl = inetSockAddrWrap.$new(proxy_addr4, 8080)
                var ret = this.connect(inetSockAddrImpl);
                console.log(addr.toString());
                // } else if (addr.toString().endsWith("127.0.0.1:27042")){
                //     var inetSockAddrImpl = inetSockAddrWrap.$new("127.0.0.1", 1)
                //     send('{"java":{"protocol":"tcp","function":"Socket::connect(SocketAddress, int)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.getLocalSocketAddress() + '"}}');
                //     var ret = this.connect(inetSockAddrImpl);
            } else {
                var ret = this.connect(addr);
            }

            if (JavaConnectionPool[addr.toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = [String(this.getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')].push(String(this.getLocalSocketAddress()).replace(/^.*\//, ''));
            }
            // JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = String(this.getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"tcp","function":"Socket::connect(SocketAddress)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };
        datagramSocket.connect.overload('java.net.InetAddress', 'int').implementation = function (addr, timeout) {
            var ret = this.connect(addr, timeout);
            if (JavaConnectionPool[addr.toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = [String(this.getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')].push(String(this.getLocalSocketAddress()).replace(/^.*\//, ''));
            }
            // JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = String(this.getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"tcp","function":"DatagramSocket::connect(SocketAddress, int)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };
        datagramSocket.connect.overload('java.net.SocketAddress').implementation = function (addr) {
            var ret = this.connect(addr);
            if (JavaConnectionPool[addr.toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = [String(this.getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')].push(String(this.getLocalSocketAddress()).replace(/^.*\//, ''));
            }
            // JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = String(this.getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"tcp","function":"DatagramSocket::connect(SocketAddress)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };
        datagramSocket.send.implementation = function (dp) {
            var ret = this.send(dp);
            if (JavaConnectionPool[dp.getSocketAddress().toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[dp.getSocketAddress().toString().replace(/^.*\//, '')] = [String(this.getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[dp.getSocketAddress().toString().replace(/^.*\//, '')].push(String(this.getLocalSocketAddress()).replace(/^.*\//, ''));
            }
            // JavaConnectionPool[dp.getSocketAddress().toString().replace(/^.*\//, '')] = String(this.getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"udp","function":"DatagramSocket::send","pid":' + Process.id + ',"address":"' + dp.getSocketAddress().toString() + '","local_address":"' + this.getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };
        datagramSocket.receive.implementation = function (dp) {
            var ret = this.receive(dp);
            if (JavaConnectionPool[dp.getSocketAddress().toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[dp.getSocketAddress().toString().replace(/^.*\//, '')] = [String(this.getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[dp.getSocketAddress().toString().replace(/^.*\//, '')].push(String(this.getLocalSocketAddress()).replace(/^.*\//, ''));
            }
            // JavaConnectionPool[dp.getSocketAddress().toString().replace(/^.*\//, '')] = String(this.getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"udp","function":"DatagramSocket::receive","pid":' + Process.id + ',"address":"' + dp.getSocketAddress().toString() + '","local_address":"' + this.getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };
        socketChannel.connect.implementation = function (addr) {
            var ret = this.connect(addr);
            if (JavaConnectionPool[addr.toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = [String(this.socket().getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')].push(String(this.socket().getLocalSocketAddress()).replace(/^.*\//, ''));
            }

            // JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = String(this.getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"tcp","function":"SocketChannel::connect(SocketAddress)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.socket().getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };
        socketChannel.open.overload('java.net.SocketAddress').implementation = function (addr) {
            var ret = this.open(addr);
            if (JavaConnectionPool[addr.toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = [String(this.socket().getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')].push(String(this.socket().getLocalSocketAddress()).replace(/^.*\//, ''));
            }
            // JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = String(this.socket().getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"tcp","function":"SocketChannel::open(SocketAddress)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.socket().getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };
        datagramChannel.connect.implementation = function (addr) {
            var ret = this.connect(addr);
            if (JavaConnectionPool[addr.toString().replace(/^.*\//, '')] == undefined) {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = [String(this.socket().getLocalSocketAddress()).replace(/^.*\//, '')]
            } else {
                JavaConnectionPool[addr.toString().replace(/^.*\//, '')].push(String(this.socket().getLocalSocketAddress()).replace(/^.*\//, ''));
            }
            // JavaConnectionPool[addr.toString().replace(/^.*\//, '')] = String(this.socket().getLocalSocketAddress()).replace(/^.*\//, '');
            send('{"java":{"protocol":"tcp","function":"DatagramChannel::connect(SocketAddress)","pid":' + Process.id + ',"address":"' + addr.toString() + '","local_address":"' + this.socket().getLocalSocketAddress() + '"}}');
            send('{"deviceid":"' + SettingsSecure.getString(Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver(), 'android_id') + '"}');
            return ret;
        };
    });
}, 0);