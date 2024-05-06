
// function inet4_ntoa(int) {
//     return ((int >> 24) & 255) + "." + ((int >> 16) & 255) + "." + ((int >> 8) & 255) + "." + (int & 255);
// }

// Interceptor.attach(Module.findExportByName("libc.so", "pthread_create"), {
//     onEnter: function (args) {
//         this.id = null
//         this.m = null;
//         // console.log('Pthreaaaaad from:\n' + Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n') + '\n');
//         // console.log(JSON.stringify(this.context));
//         // console.log("Pthreaaaaad from"+DebugSymbol.fromAddress(this.context.lr).moduleName)
//         if (Process.enumerateModules()
//             .filter(function (m) {
//                 // return true;
//                 return m.path.startsWith("/data/app/") && m.path.endsWith(".so");
//             }).map(function (m) {
//                 return m.name;
//             }).includes(DebugSymbol.fromAddress(this.context.lr).moduleName)) {
//             this.id = args[0]
//             this.m = DebugSymbol.fromAddress(this.context.lr).moduleName

//             console.log(DebugSymbol.fromAddress(this.context.lr));
//             console.log("----");
//             console.log(DebugSymbol.fromAddress(args[2]));
//             console.log("----");

//             console.log(JSON.stringify(this.context, null, 2));

//             console.log('pthread_create called from:\n' +
//                 Thread.backtrace(this.context, Backtracer.ACCURATE) // FUZZY ACCURATE
//                     .map(DebugSymbol.fromAddress).join('\n') + '\n');


//         }

//     },
//     onLeave: function (retval) {
//         if (this.id) {
//             console.log(this.m + "===>" + ptr(this.id).readUInt())
//         }
//         //   if (this.flag) // passed from onEnter
//         //     console.warn("\nretval: " + retval);
//     }
// });


Process
    .getModuleByName({ linux: 'libc.so', darwin: 'libSystem.B.dylib', windows: 'ws2_32.dll' }[Process.platform])
    .enumerateExports().filter(ex => ex.type === 'function' && ['connect', 'recv', 'send', 'sendto', 'recvfrom', 'accept', 'listen', 'bind'].some(prefix => ex.name.indexOf(prefix) === 0))
    .forEach(ex => {
        Interceptor.attach(ex.address, {
            onEnter: function (args) {
                this.fd = args[0].toInt32();
                this.socketType = Socket.type(this.fd);
                if (this.socketType == 'tcp' || this.socketType == 'udp' || this.socketType == 'tcp6' || this.socketType == 'udp6') {
                    this.ipAddress = null;
                    this.portAddress = null;
                    this.localIpAddress = null;
                    this.localPortAddress = null;


                    var address = Socket.peerAddress(this.fd);
                    var local_address = Socket.localAddress(this.fd);
                    if (address != null) {
                        this.ipAddress = address.ip;
                        this.portAddress = address.port;
                    }
                    if (local_address != null) {
                        this.localIpAddress = local_address.ip;
                        this.localPortAddress = local_address.port;
                    }
                    if (ex.name == "connect" || ex.name == "bind" || ex.name == "accept") {
                        this.portAddress = ntohs(Memory.readU16(ptr(args[1]).add(2)));
                        this.ipAddress = inet_ntop(Memory.readByteArray(ptr(args[1]).add(this.socketType.slice(-1) == '6' ? 8 : 4), this.socketType.slice(-1) == '6' ? 16 : 4));
                        if (ex.name == "connect" && this.portAddress == 443 && this.socketType.startsWith('tcp')) {
                            var socketType = this.socketType;
                            Process.enumerateRanges('rw-')
                                .forEach(function (m) {
                                    if (m.base.toInt32() < args[1].toInt32() && args[1].toInt32() - m.base.toInt32() < m.size) {
                                        // console.log(this.portAddress)
                                        ptr(args[1]).add(2).writeU16(36895);
                                        if (socketType.slice(-1) == '6') {
                                            ptr(args[1]).add(8).writeByteArray(inet_pton(proxy_addr6));
                                        } else {
                                            ptr(args[1]).add(4).writeByteArray(inet_pton(proxy_addr4));
                                        }
                                    }
                                });
                            //00 00 00 00 00 00 00 00 00 00 ff ff 0a 2a 00 01
                            //36895
                            //::ffff:a2a:1
                            //0a 2a 00 01
                            //10.42.0.1
                        }
                        if (ex.name == "bind") {
                            this.localPortAddress = this.portAddress;
                            this.localIpAddress = this.ipAddress;
                        }
                    } else if ((ex.name == "sendto" || ex.name == "recvfrom") && args[4] != 0x0) {
                        this.portAddress = ntohs(Memory.readU16(ptr(args[4]).add(2)));
                        this.ipAddress = inet_ntop(Memory.readByteArray(ptr(args[4]).add(this.socketType.slice(-1) == '6' ? 8 : 4), this.socketType.slice(-1) == '6' ? 16 : 4));
                    }
                    if (ex.name == "listen" || ex.name == "bind") {
                        this.portAddress = null;
                        this.ipAddress = null;
                    }
                    // if (this.portAddress == null || this.ipAddress == null || this.localPortAddress == null || this.localIpAddress == null) {
                    //     console.log(ex.name);
                    //     return
                    // }
                }

            },
            onLeave: function (retval) {
                if (this.socketType == 'tcp' || this.socketType == 'udp' || this.socketType == 'tcp6' || this.socketType == 'udp6') {
                    if (this.localPortAddress == 0 && ex.name == "connect") {
                        var local_address = Socket.localAddress(this.fd);
                        if (local_address != null) {
                            this.localIpAddress = local_address.ip;
                            this.localPortAddress = local_address.port;
                        }
                    }
                    if (JavaConnectionPool[(this.ipAddress + ':' + this.portAddress).replace(/^::ffff:/, '')] !== undefined && JavaConnectionPool[(this.ipAddress + ':' + this.portAddress).replace(/^::ffff:/, '')].includes((this.localIpAddress + ':' + this.localPortAddress).replace(/^::ffff:/, ''))) {
                        send('{"java":{"protocol":"' + this.socketType + '","fd":"' + this.fd + '","function":"' + ex.name + '","pid":' + Process.id + ',"address":"' + this.ipAddress + ':' + this.portAddress + '","local_address":"' + this.localIpAddress + ':' + this.localPortAddress + '"}}');

                    } else {
                        send('{"native":{"protocol":"' + this.socketType + '","fd":"' + this.fd + '","function":"' + ex.name + '","pid":' + Process.id + ',"address":"' + this.ipAddress + ':' + this.portAddress + '","local_address":"' + this.localIpAddress + ':' + this.localPortAddress + '"}}');
                    }
                    if (ex.name == "connect" && (this.ipAddress == "127.0.0.1" || this.ipAddress == "::ffff:7f00:1" || this.ipAddress == "::1") && this.portAddress == 27042 && this.socketType.startsWith('tcp')) {
                        retval.replace(-1);
                    }
                }
            }

        })
    })

